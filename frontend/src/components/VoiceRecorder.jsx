import React, { useState, useEffect, useRef } from 'react';
import { Mic, Square, Play, RotateCcw, Volume2 } from 'lucide-react';

export default function VoiceRecorder({ onTranscriptChange, initialText = '' }) {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState(initialText);
  const [audioUrl, setAudioUrl] = useState(null);
  const [audioLevels, setAudioLevels] = useState([10, 15, 10, 20, 15, 10, 25, 15, 10, 20]);
  const [timer, setTimer] = useState(0);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recognitionRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animFrameRef = useRef(null);
  const timerIntervalRef = useRef(null);

  const baseTranscriptRef = useRef(initialText);

  const initialTextAtStartRef = useRef(initialText);

  useEffect(() => {
    if (!isRecording) {
      setTranscript(initialText || '');
      initialTextAtStartRef.current = initialText || '';
    }
  }, [initialText, isRecording]);

  // Speech Recognition setup
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        let finalConcat = '';
        let latestInterim = '';

        for (let i = 0; i < event.results.length; i++) {
          const text = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalConcat += text + ' ';
          } else {
            latestInterim = text;
          }
        }

        const base = initialTextAtStartRef.current || '';
        const fullText = (base + ' ' + finalConcat + latestInterim).replace(/\s+/g, ' ').trim();
        setTranscript(fullText);
        if (onTranscriptChange) onTranscriptChange(fullText);
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
      };

      recognitionRef.current = recognition;
    }
  }, [onTranscriptChange]);

  const startEqualizerAnimation = (stream) => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      const audioCtx = new AudioContext();
      const analyser = audioCtx.createAnalyser();
      const source = audioCtx.createMediaStreamSource(stream);

      analyser.fftSize = 32;
      source.connect(analyser);

      audioContextRef.current = audioCtx;
      analyserRef.current = analyser;

      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const updateEqualizer = () => {
        analyser.getByteFrequencyData(dataArray);
        const bars = [];
        for (let i = 0; i < 10; i++) {
          const value = dataArray[i] || 0;
          const normalized = Math.max(10, Math.min(100, Math.round((value / 255) * 100)));
          bars.push(normalized);
        }
        setAudioLevels(bars);
        animFrameRef.current = requestAnimationFrame(updateEqualizer);
      };

      updateEqualizer();
    } catch (e) {
      console.warn('AudioContext frequency analysis not supported:', e);
    }
  };

  const startRecording = async () => {
    try {
      audioChunksRef.current = [];
      initialTextAtStartRef.current = transcript; // Lock current text as base before recording starts
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);

        stream.getTracks().forEach(track => track.stop());
        if (audioContextRef.current) audioContextRef.current.close();
        if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      };

      mediaRecorder.start(250);
      setIsRecording(true);
      setAudioUrl(null);
      setTimer(0);

      timerIntervalRef.current = setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);

      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch (e) {
          console.warn('Speech recognition already started:', e);
        }
      }

      startEqualizerAnimation(stream);
    } catch (err) {
      console.error('Microphone access denied or error:', err);
      alert('Unable to access microphone. Please check browser microphone permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);

      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);

      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          console.warn('Error stopping speech recognition:', e);
        }
      }
    }
  };

  const handleTextChange = (e) => {
    const val = e.target.value;
    setTranscript(val);
    initialTextAtStartRef.current = val;
    if (onTranscriptChange) onTranscriptChange(val);
  };

  const clearTranscript = () => {
    setTranscript('');
    initialTextAtStartRef.current = '';
    setAudioUrl(null);
    if (onTranscriptChange) onTranscriptChange('');
  };

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="glass-panel p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-2xl ${isRecording ? 'bg-rose-500/10 text-rose-500 animate-pulse' : 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'}`}>
            <Mic className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">Verbal Answer Audio Recorder</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Record microphone audio & convert speech to STAR text response</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isRecording ? (
            <button
              onClick={stopRecording}
              type="button"
              className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs shadow-lg shadow-rose-600/30 flex items-center gap-2 transition-all transform hover:scale-105"
            >
              <Square className="w-4 h-4 fill-white" /> Stop ({formatTimer(timer)})
            </button>
          ) : (
            <button
              onClick={startRecording}
              type="button"
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all transform hover:scale-105"
            >
              <Mic className="w-4 h-4" /> Speak Answer
            </button>
          )}

          {transcript && (
            <button
              onClick={clearTranscript}
              type="button"
              title="Clear Answer Text"
              className="p-2.5 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* 10-Bar Real-Time Live Audio Equalizer */}
      {isRecording && (
        <div className="bg-slate-100 dark:bg-slate-900/80 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-rose-500 font-bold text-xs">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping"></span>
            <span>Recording Verbal Audio...</span>
          </div>

          <div className="flex items-end justify-center gap-1.5 h-8 w-48">
            {audioLevels.map((val, idx) => (
              <div
                key={idx}
                className="w-2 bg-gradient-to-t from-indigo-500 via-violet-500 to-rose-400 rounded-full transition-all duration-75"
                style={{ height: `${val}%` }}
              ></div>
            ))}
          </div>
        </div>
      )}

      {/* Audio Playback Controls */}
      {audioUrl && !isRecording && (
        <div className="bg-slate-100 dark:bg-slate-900/80 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-extrabold text-xs">
            <Volume2 className="w-4 h-4" />
            <span>Listen Back to Audio Recording</span>
          </div>
          <audio controls src={audioUrl} className="h-8 w-full sm:w-auto" />
        </div>
      )}

      {/* Real-Time Speech-to-Text Textarea */}
      <div className="space-y-2">
        <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300">
          Candidate Response Text (Auto-transcribed or Typed)
        </label>
        <textarea
          rows={5}
          value={transcript}
          onChange={handleTextChange}
          placeholder="Speak into your microphone or type your response here using the STAR format (Situation, Task, Action, Result)..."
          className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 font-medium leading-relaxed shadow-inner"
        ></textarea>
      </div>
    </div>
  );
}
