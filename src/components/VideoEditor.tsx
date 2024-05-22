import { useState } from "react";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";

type DataType = {
  clips: {
    [key: string]: {
      content: string;
      start: number;
      end: number;
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
      content: "red",
      start: 1,
      end: 100,
    },
    "clip-2": {
      content: "blue",
      start: 200,
      end: 300,
    },
    "clip-3": {
      content: "green",
      start: 400,
      end: 500,
    },
    "clip-4": {
      content: "yellow",
      start: 600,
      end: 700,
    },
    "clip-2-0.8634497206492759": {
      content: "yellow",
      start: 600,
      end: 700,
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
  return (
    <div style={{ width: "80vw", padding: "20px", boxSizing: "border-box" }}>
      <h1>Video Editor Timeline</h1>
      <div style={{ display: "flex", width: "100%", gap: "10px" }}>
        <DragDropContext
          onDragEnd={(result) => {
            console.log(result);
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
              width: "20%",
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
                          padding: library.clips.length === 0 ? "2.5px" : "5px",
                          background: `${
                            snapshot.isDraggingOver ? "lightgreen" : "white"
                          }`,
                          height: "150px",
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
                                    width: `${
                                      data.clips[clipId].end -
                                      data.clips[clipId].start
                                    }px`,
                                  }}
                                >
                                  {data.clips[clipId].content}
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
              width: "80%",
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
                                      width: `${
                                        data.clips[clipId].end -
                                        data.clips[clipId].start
                                      }px`,
                                    }}
                                  >
                                    {data.clips[clipId].content}
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
        </DragDropContext>
      </div>
    </div>
  );
};

export default VideoEditor;
