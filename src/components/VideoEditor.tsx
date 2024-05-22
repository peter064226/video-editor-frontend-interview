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
      clips?: string[];
    };
  };
};

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
  },
  tracks: {
    "track-1": {
      clips: ["clip-1", "clip-2"],
    },

    "track-2": {
      clips: ["clip-3"],
    },

    "track-3": {
      clips: ["clip-4"],
    },
  },
};

const VideoEditor = () => {
  const [data, setData] = useState(initialData);
  return (
    <div>
      <h1>Video editor</h1>
      <DragDropContext
        onDragEnd={(result) => {
          const { destination, source, draggableId } = result;
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
          startClips.splice(source.index, 1);
          endClips.splice(destination.index, 0, draggableId);
          const tracks = {
            ...data.tracks,
            [source.droppableId]: { ...startTrack, clips: startClips },
            [destination.droppableId]: { ...endTrack, clips: endClips },
          };
          setData({
            ...data,
            tracks: tracks,
          });
        }}
      >
        {Object.keys(data.tracks).map((trackId) => {
          const track = data.tracks[trackId];
          return (
            <div key={trackId}>
              <Droppable droppableId={trackId} direction="horizontal">
                {(provided, snapshot) => (
                  <div
                    style={{
                      display: "flex",
                      background: `${
                        snapshot.isDraggingOver ? "lightgreen" : "white"
                      }`,
                      padding: "10px",
                      border: "1px solid gray",
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
                                  snapshot.isDragging ? "lightblue" : "white"
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
      </DragDropContext>
    </div>
  );
};

export default VideoEditor;
