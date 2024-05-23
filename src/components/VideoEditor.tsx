import { useState } from "react";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";

type DataType = {
  clips: {
    [key: string]: {
      content: string;
      start: number;
      end: number;
      startNew: number;
      endNew: number;
    };
  };
  tracks: {
    [key: string]: {
      clips: string[];
    };
  };
};

const LIBRARY_ID = "library";

const initialData: DataType = {
  clips: {
    "clip-1": {
      content: "red.mp4",
      start: 1,
      end: 100,
      startNew: 1,
      endNew: 100,
    },
    "clip-2": {
      content: "blue.mp4",
      start: 1,
      end: 200,
      startNew: 1,
      endNew: 200,
    },
    "clip-3": {
      content: "green.mp4",
      start: 1,
      end: 150,
      startNew: 1,
      endNew: 150,
    },
    "clip-4": {
      content: "yellow.mp4",
      start: 1,
      end: 188,
      startNew: 1,
      endNew: 188,
    },
    "clip-2-0.8634497206492759": {
      content: "yellow",
      start: 1,
      end: 188,
      startNew: 1,
      endNew: 188,
    },
  },
  tracks: {
    [LIBRARY_ID]: {
      clips: ["clip-1", "clip-2", "clip-3", "clip-4"],
    },
    "track-1": {
      clips: ["clip-2-0.8634497206492759"],
    },
  },
};

const generateEmptyTrack = (tracks: DataType["tracks"]) => {
  const newTracks: DataType["tracks"] = {
    [`track-${Math.random()}`]: {
      clips: [],
    },
  };
  for (const key in tracks) {
    if (tracks[key].clips?.length !== 0) {
      newTracks[key] = tracks[key];
      if (key === LIBRARY_ID) continue;
      newTracks[`track-${Math.random()}`] = {
        clips: [],
      };
    }
  }

  return newTracks;
};

const VideoEditor = () => {
  const [data, setData] = useState({
    ...initialData,
    tracks: generateEmptyTrack(initialData.tracks),
  });

  const handler = (clipId: string, direction: "startNew" | "endNew") => {
    function onMouseMove(mouseMoveEvent: MouseEvent) {
      setData((data) => {
        let newValue = data.clips[clipId][direction] + mouseMoveEvent.movementX;
        if (direction === "startNew") {
          const start = data.clips[clipId]["start"];
          if (newValue < start) newValue = start;
        } else {
          const end = data.clips[clipId]["end"];
          if (newValue > end) newValue = end;
        }
        return {
          ...data,
          clips: {
            ...data.clips,
            [clipId]: {
              ...data.clips[clipId],
              [direction]: newValue,
            },
          },
        };
      });
    }
    function onMouseUp() {
      document.body.removeEventListener("mousemove", onMouseMove);
    }

    document.body.addEventListener("mousemove", onMouseMove);
    document.body.addEventListener("mouseup", onMouseUp, { once: true });
  };

  return (
    <div style={{ width: "80vw", padding: "20px", boxSizing: "border-box" }}>
      <h1>Video Editor Timeline</h1>
      <div style={{ display: "flex", width: "100%", gap: "10px" }}>
        <DragDropContext
          onDragEnd={(result) => {
            const { destination, source } = result;
            let { draggableId } = result;
            if (!destination) return;
            if (
              destination.droppableId === source.droppableId &&
              destination.index === source.index
            )
              return;

            const startTrack = data.tracks[source.droppableId];
            const isSameTrack = source.droppableId === destination.droppableId;
            const endTrack = isSameTrack
              ? startTrack
              : data.tracks[destination.droppableId];
            const startClips = [...(startTrack.clips || [])];
            const endClips = isSameTrack
              ? startClips
              : [...(endTrack.clips || [])];

            if (source.droppableId !== LIBRARY_ID) {
              startClips.splice(source.index, 1);
            }
            const clips = { ...data.clips };
            if (source.droppableId === LIBRARY_ID) {
              const copyClip = { ...data.clips[draggableId] };
              draggableId = `${draggableId}-${Math.random()}`;
              clips[draggableId] = copyClip;
            }
            endClips.splice(destination.index, 0, draggableId);
            const tracks = {
              ...data.tracks,
              [source.droppableId]: { ...startTrack, clips: startClips },
              [destination.droppableId]: { ...endTrack, clips: endClips },
            };
            setData({
              ...data,
              clips,
              tracks:
                destination.droppableId === source.droppableId
                  ? tracks
                  : generateEmptyTrack(tracks),
            });
          }}
        >
          <div
            style={{
              width: "max-content",
              minHeight: "200px",
              border: "1px solid gray",
            }}
          >
            {[LIBRARY_ID].map((libraryId) => {
              const library = data.tracks[libraryId];
              return (
                <div key={libraryId}>
                  <Droppable droppableId={libraryId} direction="vertical">
                    {(provided, snapshot) => (
                      <div
                        style={{
                          padding: "8px",
                          background: `${
                            snapshot.isDraggingOver ? "lightgreen" : "white"
                          }`,
                        }}
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                      >
                        {library.clips?.map((clipId, index) => (
                          <Draggable
                            draggableId={clipId}
                            key={clipId}
                            index={index}
                          >
                            {(provided, snapshot) => (
                              <div
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                ref={provided.innerRef}
                              >
                                <div
                                  style={{
                                    border: "1px solid gray",
                                    padding: "5px 15px",
                                    background: `${
                                      snapshot.isDragging
                                        ? "lightblue"
                                        : "white"
                                    }`,
                                    width: "120px",
                                  }}
                                >
                                  {data.clips[clipId].content}-
                                  <span style={{ fontSize: "12px" }}>
                                    {data.clips[clipId].end -
                                      data.clips[clipId].start}
                                    s
                                  </span>
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>
              );
            })}
          </div>
          <div
            style={{
              border: "1px solid gray",
              padding: "0px 8px",
              width: "100%",
              minHeight: "200px",
            }}
          >
            {Object.keys(data.tracks)
              .filter((e) => e !== LIBRARY_ID)
              .map((trackId) => {
                const track = data.tracks[trackId];
                return (
                  <div key={trackId}>
                    <Droppable droppableId={trackId} direction="horizontal">
                      {(provided, snapshot) => (
                        <div
                          key={trackId}
                          style={{
                            padding: track.clips.length === 0 ? "2.5px" : "5px",
                            display: "flex",
                            background: `${
                              snapshot.isDraggingOver ? "lightgreen" : "white"
                            }`,
                            height: track.clips.length === 0 ? "5px" : "auto",
                            border:
                              track.clips.length === 0
                                ? "none"
                                : "1px solid gray",
                          }}
                          {...provided.droppableProps}
                          ref={provided.innerRef}
                        >
                          {track.clips?.map((clipId, index) => (
                            <div
                              className="clip-drag"
                              key={clipId}
                              style={{
                                position: "relative",
                                left: `${
                                  data.clips[clipId].startNew -
                                  data.clips[clipId].start
                                }px`,
                                paddingRight: `${
                                  data.clips[clipId].startNew -
                                  data.clips[clipId].start
                                }px`,
                              }}
                            >
                              <div
                                onMouseDown={handler.bind(
                                  null,
                                  clipId,
                                  "startNew"
                                )}
                                className="clip-drag-front"
                              />
                              <Draggable
                                draggableId={clipId}
                                key={clipId}
                                index={index}
                              >
                                {(provided, snapshot) => (
                                  <div
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    ref={provided.innerRef}
                                  >
                                    <div
                                      style={{
                                        border: "1px solid gray",
                                        background: `${
                                          snapshot.isDragging
                                            ? "lightblue"
                                            : "white"
                                        }`,
                                        width: `${
                                          (data.clips[clipId].endNew ||
                                            data.clips[clipId].end) -
                                          (data.clips[clipId].startNew ||
                                            data.clips[clipId].start)
                                        }px`,
                                        overflow: "hidden",
                                        height: "24px",
                                      }}
                                    >
                                      <div
                                        style={{
                                          textAlign: "center",
                                        }}
                                      >
                                        <span style={{ fontSize: "12px" }}>
                                          {data.clips[clipId].content}-
                                          {(data.clips[clipId].endNew ||
                                            data.clips[clipId].end) -
                                            (data.clips[clipId].startNew ||
                                              data.clips[clipId].start)}
                                          s
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </Draggable>
                              <div
                                onMouseDown={handler.bind(
                                  null,
                                  clipId,
                                  "endNew"
                                )}
                                className="clip-drag-end"
                              />
                            </div>
                          ))}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </div>
                );
              })}
          </div>
        </DragDropContext>
      </div>
    </div>
  );
};

export default VideoEditor;
