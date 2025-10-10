import { jsxDEV } from "react/jsx-dev-runtime";
import React, { Fragment } from "react";
import { AbsoluteFill, Sequence, useCurrentFrame, interpolate, staticFile } from "remotion";
import {
  linearTiming,
  TransitionSeries
} from "@remotion/transitions";
import { slide } from "@remotion/transitions/slide";
const TUNING = ["E", "A", "D", "G", "B", "E"];
const NUM_FRETS = 15;
const NOTES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const NOTE_MAP = { "Db": "C#", "Eb": "D#", "Gb": "F#", "Ab": "G#", "Bb": "A#" };
const getNoteIndex = (note) => NOTES.indexOf(NOTE_MAP[note] || note);
const getNoteFromIndex = (index) => NOTES[index % 12];
const INTERVAL_SEMITONES = { "R": 0, "m2": 1, "b2": 1, "M2": 2, "2": 2, "m3": 3, "b3": 3, "M3": 4, "3": 4, "P4": 5, "4": 5, "#4": 6, "b5": 6, "P5": 7, "5": 7, "#5": 8, "m6": 8, "b6": 8, "M6": 9, "6": 9, "#6": 10, "bb7": 9, "m7": 10, "b7": 10, "M7": 11, "7": 11, "P8": 12, "b9": 1, "9": 2, "#9": 3, "11": 5, "#11": 6, "b13": 8, "13": 9 };
const INTERVAL_COLORS = {
  0: "#d32f2f",
  // R (Root)
  1: "#880e4f",
  // m2/b9
  2: "#4a148c",
  // M2/9
  3: "#0d47a1",
  // m3/#9
  4: "#1b5e20",
  // M3
  5: "#f9a825",
  // P4/11
  6: "#e65100",
  // TT/#11/b5
  7: "#bf360c",
  // P5
  8: "#5d4037",
  // m6/b13
  9: "#004d40",
  // M6/13
  10: "#37474f",
  // m7/b7
  11: "#f57f17"
  // M7
};
const Piano = ({ rootNote, intervals, isScale, scaleIntervals }) => {
  if (!rootNote || !intervals || intervals.length === 0) {
    return null;
  }
  const rootNoteIndex = getNoteIndex(rootNote);
  if (rootNoteIndex === -1) return null;
  const intervalsToSemitones = (ints) => ints.map((interval) => INTERVAL_SEMITONES[interval]).filter((s) => s !== void 0);
  let finalIntervals = intervals;
  if (typeof intervals === "object" && !Array.isArray(intervals)) {
    const scaleSemitoneSet = new Set(intervalsToSemitones(intervals.scale));
    finalIntervals = intervals.chord.filter((interval) => {
      const semitone = INTERVAL_SEMITONES[interval];
      return semitone !== void 0 && scaleSemitoneSet.has(semitone);
    });
  }
  const semitoneOffsets = intervalsToSemitones(finalIntervals);
  const noteIndices = new Set(semitoneOffsets.map((offset) => (rootNoteIndex + offset) % 12));
  const pianoKeyInfo = [
    { name: "C", type: "white", semitone: 0 },
    { name: "C#", type: "black", semitone: 1 },
    { name: "D", type: "white", semitone: 2 },
    { name: "D#", type: "black", semitone: 3 },
    { name: "E", type: "white", semitone: 4 },
    { name: "F", type: "white", semitone: 5 },
    { name: "F#", type: "black", semitone: 6 },
    { name: "G", type: "white", semitone: 7 },
    { name: "G#", type: "black", semitone: 8 },
    { name: "A", type: "white", semitone: 9 },
    { name: "A#", type: "black", semitone: 10 },
    { name: "B", type: "white", semitone: 11 }
  ];
  const fourOctavesKeys = [...pianoKeyInfo, ...pianoKeyInfo, ...pianoKeyInfo, ...pianoKeyInfo];
  return /* @__PURE__ */ jsxDEV("div", { style: { display: "flex", position: "relative", height: 180, width: 842, border: "1px solid black", transform: "scale(1.1)" }, children: [
    fourOctavesKeys.filter((k) => k.type === "white").map((key, i) => /* @__PURE__ */ jsxDEV("div", { style: { width: 30, height: 180, border: "1px solid #333", boxSizing: "border-box", backgroundColor: "white", zIndex: 1, position: "relative" }, children: noteIndices.has(key.semitone) && /* @__PURE__ */ jsxDEV(PianoNoteMarker, { rootNoteIndex, currentSemitone: key.semitone, intervals: finalIntervals, semitoneOffsets }, void 0, false, {
      fileName: "<stdin>",
      lineNumber: 70,
      columnNumber: 55
    }) }, `${key.semitone}-${i}`, false, {
      fileName: "<stdin>",
      lineNumber: 69,
      columnNumber: 17
    })),
    fourOctavesKeys.map((key, i) => {
      if (key.type !== "black") return null;
      const octave = Math.floor(i / 12);
      const indexInOctave = i % 12;
      const whiteKeysBefore = pianoKeyInfo.slice(0, indexInOctave).filter((k) => k.type === "white").length;
      const leftPosition = octave * 7 * 30 + whiteKeysBefore * 30 - 10;
      return /* @__PURE__ */ jsxDEV("div", { style: { width: 20, height: 108, border: "1px solid #333", boxSizing: "border-box", backgroundColor: "#333", zIndex: 2, position: "absolute", left: leftPosition, top: 0 }, children: noteIndices.has(key.semitone) && /* @__PURE__ */ jsxDEV(PianoNoteMarker, { rootNoteIndex, currentSemitone: key.semitone, intervals: finalIntervals, semitoneOffsets }, void 0, false, {
        fileName: "<stdin>",
        lineNumber: 83,
        columnNumber: 60
      }) }, `${key.semitone}-${i}`, false, {
        fileName: "<stdin>",
        lineNumber: 82,
        columnNumber: 21
      });
    })
  ] }, void 0, true, {
    fileName: "<stdin>",
    lineNumber: 67,
    columnNumber: 9
  });
};
const PianoNoteMarker = ({ rootNoteIndex, currentSemitone, intervals, semitoneOffsets }) => {
  const noteOffset = (currentSemitone - rootNoteIndex + 12) % 12;
  const color = INTERVAL_COLORS[noteOffset] || "#333";
  let text = " ";
  if (noteOffset === 0) {
    text = "R";
  } else {
    const intervalIndex = semitoneOffsets.indexOf(noteOffset);
    if (intervalIndex !== -1) {
      text = intervals[intervalIndex];
    }
  }
  return /* @__PURE__ */ jsxDEV("div", { style: {
    position: "absolute",
    bottom: 8,
    left: "50%",
    transform: "translateX(-50%)",
    width: 20,
    height: 20,
    borderRadius: "50%",
    backgroundColor: color,
    color: "white",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontSize: 12,
    fontWeight: "bold",
    boxShadow: "1px 1px 3px rgba(0,0,0,0.5)"
  }, children: text }, void 0, false, {
    fileName: "<stdin>",
    lineNumber: 106,
    columnNumber: 9
  });
};
const Fretboard = ({ rootNote, scaleIntervals, intervals, isScale, activeStrings, fretboardDisplayMode, tuning }) => {
  const TUNING2 = tuning || ["E", "A", "D", "G", "B", "E"];
  const NUM_FRETS2 = 15;
  if (!rootNote || !intervals || intervals.length === 0) {
    return null;
  }
  const rootNoteIndex = getNoteIndex(rootNote);
  if (rootNoteIndex === -1) return null;
  const intervalsToSemitones = (ints) => ints.map((interval) => INTERVAL_SEMITONES[interval]).filter((s) => s !== void 0);
  let finalIntervals = intervals;
  if (typeof intervals === "object" && !Array.isArray(intervals)) {
    const scaleSemitoneSet = new Set(intervalsToSemitones(intervals.scale));
    finalIntervals = intervals.chord.filter((interval) => {
      const semitone = INTERVAL_SEMITONES[interval];
      return semitone !== void 0 && scaleSemitoneSet.has(semitone);
    });
  }
  const semitoneOffsets = intervalsToSemitones(finalIntervals);
  const noteIndices = new Set(semitoneOffsets.map((offset) => (rootNoteIndex + offset) % 12));
  const scaleSemitones = scaleIntervals ? intervalsToSemitones(scaleIntervals) : [];
  return /* @__PURE__ */ jsxDEV("div", { style: {
    display: "table",
    borderSpacing: 0,
    background: "linear-gradient(to right, #f5d6ab, #c7a57a)",
    border: "2px solid #4a2c2a",
    borderRadius: 5,
    transform: "scale(1.1)"
    // Make it a bit bigger in the frame
  }, children: TUNING2.slice().reverse().map((openNote, i) => {
    const stringNumber = i + 1;
    const stringStyle = { display: "table-row", opacity: activeStrings && !activeStrings.includes(stringNumber) ? 0.3 : 1 };
    return /* @__PURE__ */ jsxDEV("div", { style: stringStyle, children: Array.from({ length: NUM_FRETS2 + 1 }).map((_, fret) => {
      const fretStyle = {
        display: "table-cell",
        minWidth: 60,
        height: 35,
        borderRight: "2px solid #888",
        position: "relative",
        boxSizing: "border-box"
      };
      if (fret === 0) {
        fretStyle.minWidth = 15;
        fretStyle.borderRight = "6px solid #111";
      }
      const openNoteIndex = getNoteIndex(openNote);
      const currentNoteIndex = (openNoteIndex + fret) % 12;
      const hasNote = noteIndices.has(currentNoteIndex);
      const numStrings = TUNING2.length;
      const baseThickness = [1, 1.5, 2, 2, 3, 3];
      let stringLineHeight = 1.5;
      if (numStrings === 6) {
        stringLineHeight = baseThickness[i];
      } else if (numStrings === 4) {
        stringLineHeight = [2, 2.5, 3, 3.5][i];
      } else if (numStrings === 7) {
        stringLineHeight = [1, 1.5, 2, 2, 3, 3, 3.5][i];
      } else if (numStrings === 8) {
        stringLineHeight = [1, 1.5, 2, 2, 3, 3, 3.5, 4][i];
      }
      return /* @__PURE__ */ jsxDEV("div", { style: fretStyle, children: [
        fret > 0 && /* @__PURE__ */ jsxDEV("span", { style: { position: "absolute", height: "100%", width: 1, backgroundColor: "#ccc", right: 0, top: 0, zIndex: 1 } }, void 0, false, {
          fileName: "<stdin>",
          lineNumber: 187,
          columnNumber: 32
        }),
        /* @__PURE__ */ jsxDEV("div", { style: { position: "absolute", width: "100%", backgroundColor: "#666", left: 0, top: "50%", transform: "translateY(-50%)", zIndex: 2, height: stringLineHeight } }, void 0, false, {
          fileName: "<stdin>",
          lineNumber: 188,
          columnNumber: 19
        }),
        hasNote && /* @__PURE__ */ jsxDEV(
          NoteMarker,
          {
            rootNoteIndex,
            currentNoteIndex,
            isScale,
            scaleIntervals,
            scaleSemitones,
            intervals: finalIntervals,
            semitoneOffsets,
            fretboardDisplayMode
          },
          void 0,
          false,
          {
            fileName: "<stdin>",
            lineNumber: 189,
            columnNumber: 31
          }
        )
      ] }, fret, true, {
        fileName: "<stdin>",
        lineNumber: 186,
        columnNumber: 17
      });
    }) }, i, false, {
      fileName: "<stdin>",
      lineNumber: 155,
      columnNumber: 11
    });
  }) }, void 0, false, {
    fileName: "<stdin>",
    lineNumber: 145,
    columnNumber: 5
  });
};
const NoteMarker = ({ rootNoteIndex, currentNoteIndex, isScale, scaleIntervals, scaleSemitones, intervals, semitoneOffsets, fretboardDisplayMode }) => {
  const isRoot = currentNoteIndex === rootNoteIndex;
  let text = getNoteFromIndex(currentNoteIndex);
  const noteOffset = (currentNoteIndex - rootNoteIndex + 12) % 12;
  const color = INTERVAL_COLORS[noteOffset] || "#333";
  if (fretboardDisplayMode === "intervals") {
    if (isRoot) {
      text = "R";
    } else {
      if (isScale && scaleIntervals) {
        const scaleIndex = scaleSemitones.indexOf(noteOffset);
        text = scaleIndex !== -1 ? scaleIntervals[scaleIndex] : text;
      } else if (intervals) {
        const intervalIndex = semitoneOffsets.indexOf(noteOffset);
        if (intervalIndex !== -1) {
          text = intervals[intervalIndex];
        }
      }
    }
  }
  return /* @__PURE__ */ jsxDEV("div", { style: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: 26,
    height: 26,
    borderRadius: "50%",
    backgroundColor: color,
    color: "white",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontSize: 14,
    fontWeight: "bold",
    zIndex: 3,
    boxShadow: "1px 1px 3px rgba(0,0,0,0.5)"
  }, children: text }, void 0, false, {
    fileName: "<stdin>",
    lineNumber: 234,
    columnNumber: 5
  });
};
const Slide = ({ title, value, ...diagramProps }) => {
  return /* @__PURE__ */ jsxDEV(AbsoluteFill, { style: { backgroundColor: "#f0f0f0", justifyContent: "center", alignItems: "center", display: "flex", flexDirection: "column", gap: 10 }, children: [
    /* @__PURE__ */ jsxDEV("h3", { style: { fontSize: 48, margin: 0 }, children: title }, void 0, false, {
      fileName: "<stdin>",
      lineNumber: 250,
      columnNumber: 7
    }),
    value && /* @__PURE__ */ jsxDEV("h4", { style: { fontSize: 36, margin: 0, fontWeight: "normal" }, children: value }, void 0, false, {
      fileName: "<stdin>",
      lineNumber: 251,
      columnNumber: 17
    }),
    /* @__PURE__ */ jsxDEV("div", { style: { margin: "20px", display: "flex", justifyContent: "center", alignItems: "flex-start", gap: "30px", flexWrap: "wrap" }, children: [
      /* @__PURE__ */ jsxDEV(Fretboard, { ...diagramProps }, void 0, false, {
        fileName: "<stdin>",
        lineNumber: 253,
        columnNumber: 9
      }),
      /* @__PURE__ */ jsxDEV(Piano, { ...diagramProps }, void 0, false, {
        fileName: "<stdin>",
        lineNumber: 254,
        columnNumber: 9
      })
    ] }, void 0, true, {
      fileName: "<stdin>",
      lineNumber: 252,
      columnNumber: 7
    })
  ] }, void 0, true, {
    fileName: "<stdin>",
    lineNumber: 249,
    columnNumber: 5
  });
};
const SlideshowComposition = ({ slides, duration, rootNote, scaleIntervals, fretboardDisplayMode, tuning }) => {
  const durationInFrames = duration * 30;
  return /* @__PURE__ */ jsxDEV(AbsoluteFill, { style: { backgroundColor: "#f0f0f0" }, children: /* @__PURE__ */ jsxDEV(TransitionSeries, { children: slides.map((slideData, index) => /* @__PURE__ */ jsxDEV(Fragment, { children: [
    /* @__PURE__ */ jsxDEV(TransitionSeries.Sequence, { durationInFrames, children: /* @__PURE__ */ jsxDEV(
      Slide,
      {
        title: slideData.title,
        value: slideData.value,
        rootNote,
        scaleIntervals,
        intervals: slideData.intervals,
        isScale: slideData.isScale,
        activeStrings: slideData.activeStrings,
        fretboardDisplayMode,
        tuning
      },
      void 0,
      false,
      {
        fileName: "<stdin>",
        lineNumber: 269,
        columnNumber: 15
      }
    ) }, void 0, false, {
      fileName: "<stdin>",
      lineNumber: 268,
      columnNumber: 13
    }),
    index < slides.length - 1 && /* @__PURE__ */ jsxDEV(
      TransitionSeries.Transition,
      {
        timing: linearTiming({ durationInFrames: 15 }),
        presentation: slide({ direction: "from-right" })
      },
      void 0,
      false,
      {
        fileName: "<stdin>",
        lineNumber: 282,
        columnNumber: 15
      }
    )
  ] }, index, true, {
    fileName: "<stdin>",
    lineNumber: 267,
    columnNumber: 11
  })) }, void 0, false, {
    fileName: "<stdin>",
    lineNumber: 265,
    columnNumber: 7
  }) }, void 0, false, {
    fileName: "<stdin>",
    lineNumber: 264,
    columnNumber: 5
  });
};
export {
  SlideshowComposition
};
