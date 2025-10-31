"use client";
import { useEffect, useState, useRef, useCallback } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import {
  Maximize,
  Minimize,
  Pause,
  Play,
  Loader2,
  Users,
  Settings,
  Circle,
  Square,
} from "lucide-react";
import { useModelPool, ModelPoolProvider } from "../../hooks/useModelPool";

// Define skeleton connections (hip, knee, etc.) for visualization
const COCO17_CONNECTIONS = [
  [0, 1, "", "#1f77b4"],
  [1, 2, "mixamorigRighUpLeg", "#aec7e8"],
  [2, 3, "mixamorigRighLeg", "#ff7f0e"],
  [2, 2, "mixamorigRighFoot", "#c7c7c7"],
  [0, 4, "", "#ffbb78"],
  [4, 5, "mixamorigLefttUpLeg", "#2ca02c"],
  [5, 6, "mixamorigLefttLeg", "#98df8a"],
  [6, 6, "mixamorigLefttFoot", "#e377c2"],
  [0, 7, "mixamorigHips", "#d62728"],
  [7, 8, "mixamorigSpine2", "#ff9896"],
  [8, 9, "mixamorigNeck", "#9467bd"],
  [9, 10, "mixamorigHead", "#c5b0d5"],
  [7, 11, "", "#8c564b"],
  [11, 12, "mixamorigRightArm", "#c49c94"],
  [12, 13, "mixamorigRightForeArm", "#e377c2"],
  [13, 13, "mixamorigRightHand", "#e377c2"],
  [7, 14, "", "#f7b6d2"],
  [14, 15, "mixamorigLeftArm", "#7f7f7f"],
  [15, 16, "mixamorigLeftForeArm", "#c7c7c7"],
  [16, 16, "mixamorigLeftHand", "#c7c7c7"],
];

const ROTATE_CONNECTIONS = [];

// Default model options
const DEFAULT_MODEL_OPTIONS = [
  { value: "/models/aobabamerge.fbx", label: "Áo bà ba 1" },
  // { value: "/models/aodainammau1.fbx", label: "Áo dài" },
  // { value: "/models/aobabamau1.fbx", label: "Áo bà ba 2" },
  { value: "/models/BA-BA-skeleton.fbx", label: "Áo bà ba 2" },
  { value: "/models/AO-DAI-skeleton.fbx", label: "Áo dài" },
];

// Loading Component
function LoadingSpinner() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80 z-10">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        <p className="text-gray-600 text-sm">Đang tải model...</p>
      </div>
    </div>
  );
}

// Character Settings Panel
function CharacterSettingsPanel({
  characters,
  onCharacterChange,
  onClose,
  modelOptions = DEFAULT_MODEL_OPTIONS,
}) {
  const [localCharacters, setLocalCharacters] = useState(characters);

  const handleModelChange = (index, modelPath) => {
    const updatedCharacters = [...localCharacters];
    updatedCharacters[index] = {
      ...updatedCharacters[index],
      model: modelPath,
    };
    setLocalCharacters(updatedCharacters);
  };

  const handleScaleChange = (index, scale) => {
    const updatedCharacters = [...localCharacters];
    updatedCharacters[index] = {
      ...updatedCharacters[index],
      scale: parseFloat(scale),
    };
    setLocalCharacters(updatedCharacters);
  };

  const applyChanges = () => {
    onCharacterChange(localCharacters);
    onClose();
  };

  return (
    <div className="absolute top-16 right-4 bg-white border border-gray-300 rounded-lg shadow-xl z-20 p-4 min-w-80">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Cài đặt nhân vật
        </h3>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 transition-colors"
        >
          ✕
        </button>
      </div>

      <div className="space-y-4 max-h-96 overflow-y-auto">
        {localCharacters.map((character, index) => (
          <div key={index} className="border border-gray-200 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-gray-700">
                Nhân vật {index + 1}
              </h4>
              <span
                className={`px-2 py-1 rounded-full text-xs ${
                  character.isLoading
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-green-100 text-green-800"
                }`}
              >
                {character.isLoading ? "Đang tải..." : "Sẵn sàng"}
              </span>
            </div>

            <div className="space-y-2">
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Model
                </label>
                <select
                  value={character.model}
                  onChange={(e) => handleModelChange(index, e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {modelOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Tỷ lệ: {character.scale}x
                </label>
                <input
                  type="range"
                  min="0.01"
                  max="3"
                  step="0.01"
                  value={character.scale}
                  onChange={(e) => handleScaleChange(index, e.target.value)}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-thumb"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-2 mt-4 pt-4 border-t border-gray-200">
        <button
          onClick={onClose}
          className="flex-1 py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Hủy
        </button>
        <button
          onClick={applyChanges}
          className="flex-1 py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          Áp dụng
        </button>
      </div>
    </div>
  );
}

// Simple Orbit Controls
function SimpleOrbitControls(props) {
  const { camera, gl } = useThree();

  return (
    <OrbitControls
      args={[camera, gl.domElement]}
      enablePan={true}
      enableZoom={true}
      enableRotate={true}
      {...props}
    />
  );
}

// AnimatedCharacter Component
function AnimatedCharacter({
  source,
  frames,
  currentFrame,
  modelScale,
  onLoadComplete,
  characterIndex,
  onLoadStart,
}) {
  const groupRef = useRef();
  const [model, setModel] = useState(null);
  const [bones, setBones] = useState(null);
  const { getModelFromPool, returnModelToPool } = useModelPool();
  const currentModelRef = useRef(null);

  // Load model từ pool với Object Pooling
  useEffect(() => {
    if (!source) return;

    console.log(`🚀 Loading character ${characterIndex} from pool: ${source}`);
    onLoadStart?.();

    let isMounted = true;
    currentModelRef.current = null;

    getModelFromPool(source)
      .then((modelInstance) => {
        if (!isMounted) {
          returnModelToPool(source, modelInstance);
          return;
        }

        currentModelRef.current = modelInstance;

        // Setup model
        modelInstance.position.y += 1 * (modelScale || 1);
        modelInstance.position.z -= 1 * (modelScale || 1);
        modelInstance.scale.set(
          modelScale || 1,
          modelScale || 1,
          modelScale || 1
        );

        // Extract bones và setup skeleton
        modelInstance.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
          if (child.isSkinnedMesh) {
            child.skeleton.pose();
            const bonesMap = {};
            child.skeleton.bones.forEach((bone) => {
              bonesMap[bone.name] = bone;
            });
            setBones(bonesMap);
          }
        });

        setModel(modelInstance);
        onLoadComplete();
        console.log(
          `✅ Character ${characterIndex} loaded successfully from pool`
        );
      })
      .catch((error) => {
        console.error(
          `❌ Error loading character ${characterIndex} from pool:`,
          error
        );
        onLoadComplete();
      });

    return () => {
      isMounted = false;
      if (currentModelRef.current && source) {
        console.log(
          `🧹 Cleaning up character ${characterIndex}, returning model to pool`
        );
        returnModelToPool(source, currentModelRef.current);
      }
    };
  }, [source, modelScale, characterIndex]);

  // Animate the model based on current frame
  useFrame(() => {
    if (!frames?.length || !bones || !model || currentFrame === undefined)
      return;

    const frame = frames[currentFrame];
    if (!frame) return;

    COCO17_CONNECTIONS.forEach(([i, j, boneName]) => {
      if (boneName && bones[boneName]) {
        const bone = bones[boneName];

        const p1 = new THREE.Vector3(-frame[i][0], -frame[i][2], -frame[i][1]);
        const p2 =
          i === j && (i === 2 || i === 6)
            ? new THREE.Vector3(-frame[i][0], -frame[i][2] - 0.5, -frame[i][1])
            : new THREE.Vector3(-frame[j][0], -frame[j][2], -frame[j][1]);

        const localStart = bone.parent
          ? bone.parent.worldToLocal(p1.clone())
          : p1.clone();
        const localEnd = bone.parent
          ? bone.parent.worldToLocal(p2.clone())
          : p2.clone();

        const dir = new THREE.Vector3()
          .subVectors(localEnd, localStart)
          .normalize();
        const targetQuat = new THREE.Quaternion().setFromUnitVectors(
          new THREE.Vector3(0, 1, 0),
          dir
        );

        bone.quaternion.slerp(targetQuat, 0.1);
      }
    });

    ROTATE_CONNECTIONS.forEach(([i, j, boneName]) => {
      if (boneName && bones[boneName]) {
        const bone = bones[boneName];

        const p1 = new THREE.Vector3(-frame[i][0], -frame[i][2], -frame[i][1]);
        const p2 = new THREE.Vector3(-frame[j][0], -frame[j][2], -frame[j][1]);

        const localStart = bone.parent
          ? bone.parent.worldToLocal(p1.clone())
          : p1.clone();
        const localEnd = bone.parent
          ? bone.parent.worldToLocal(p2.clone())
          : p2.clone();

        const dir = new THREE.Vector3()
          .subVectors(localEnd, localStart)
          .normalize();
        const targetQuat = new THREE.Quaternion().setFromUnitVectors(
          new THREE.Vector3(0, 0, 1),
          dir
        );

        bone.quaternion.slerp(targetQuat, 0.1);
      }
    });
  });

  return model ? (
    <group ref={groupRef}>
      <primitive object={model} />
    </group>
  ) : null;
}

// Hook cho Recording toàn bộ frames
function useFullRecording() {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recordingProgress, setRecordingProgress] = useState(0);
  const [recordedFramesCount, setRecordedFramesCount] = useState(0);

  const framesRef = useRef([]);
  const isRecordingRef = useRef(false);
  const totalFramesRef = useRef(0);
  const currentFrameRef = useRef(0);
  const onRecordingCompleteRef = useRef(null);

  const startRecording = useCallback((totalFrames, onComplete) => {
    console.log(`🎥 Starting recording for ${totalFrames} frames`);
    setIsRecording(true);
    isRecordingRef.current = true;
    setRecordingProgress(0);
    setRecordedFramesCount(0);
    framesRef.current = [];
    totalFramesRef.current = totalFrames;
    currentFrameRef.current = 0;
    onRecordingCompleteRef.current = onComplete;
  }, []);

  const captureFrame = useCallback((canvas, frameIndex) => {
    if (!isRecordingRef.current || !canvas) return false;

    try {
      // Đảm bảo canvas đã render xong
      const context = canvas.getContext("webgl2") || canvas.getContext("webgl");
      if (context) {
        context.flush();
      }

      // Tạo offscreen canvas để capture
      const offscreenCanvas = document.createElement("canvas");
      offscreenCanvas.width = canvas.width;
      offscreenCanvas.height = canvas.height;
      const ctx = offscreenCanvas.getContext("2d");

      // Đặt background trắng để tránh màu đen
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, offscreenCanvas.width, offscreenCanvas.height);

      // Copy frame từ main canvas
      ctx.drawImage(canvas, 0, 0);

      // Lưu frame dưới dạng data URL với chất lượng cao
      const frameData = offscreenCanvas.toDataURL("image/jpeg", 0.95);
      framesRef.current.push(frameData);

      // Cập nhật progress
      currentFrameRef.current = frameIndex + 1;
      const progress = (currentFrameRef.current / totalFramesRef.current) * 100;
      setRecordingProgress(progress);
      setRecordedFramesCount(currentFrameRef.current);

      console.log(
        `📸 Captured frame ${currentFrameRef.current}/${totalFramesRef.current}`
      );

      // Kiểm tra nếu đã ghi đủ tất cả frames
      if (currentFrameRef.current >= totalFramesRef.current) {
        console.log("✅ Đã ghi đủ tất cả frames, tự động dừng recording...");
        stopRecording();
        return true;
      }

      return false;
    } catch (error) {
      console.error("Error capturing frame:", error);
      return false;
    }
  }, []);

  const stopRecording = useCallback(async () => {
    if (!isRecordingRef.current) return;

    console.log(
      `🛑 Stopping recording, captured ${framesRef.current.length} frames`
    );
    isRecordingRef.current = false;
    setIsRecording(false);
    setIsProcessing(true);

    try {
      // Chuyển đổi frames thành video MP4
      const videoBlob = await convertFramesToMP4(framesRef.current);
      setIsProcessing(false);
      setRecordingProgress(0);
      setRecordedFramesCount(0);
      framesRef.current = [];

      console.log("✅ MP4 video conversion completed");

      // Gọi callback khi hoàn thành
      if (onRecordingCompleteRef.current) {
        onRecordingCompleteRef.current(videoBlob);
      }

      return videoBlob;
    } catch (error) {
      console.error("Error converting frames to video:", error);
      setIsProcessing(false);

      if (onRecordingCompleteRef.current) {
        onRecordingCompleteRef.current(null);
      }
      return null;
    }
  }, []);

  const manualStopRecording = useCallback(async () => {
    return await stopRecording();
  }, [stopRecording]);

  return {
    isRecording,
    isProcessing,
    recordingProgress,
    recordedFramesCount,
    startRecording,
    captureFrame,
    stopRecording: manualStopRecording,
  };
}

// Hàm chuyển đổi frames thành MP4
async function convertFramesToMP4(frames, fps = 30) {
  return new Promise((resolve, reject) => {
    if (!frames || frames.length === 0) {
      reject(new Error("No frames to convert"));
      return;
    }

    try {
      // Tạo canvas ảo để encode video
      const virtualCanvas = document.createElement("canvas");
      const ctx = virtualCanvas.getContext("2d");

      // Lấy kích thước từ frame đầu tiên
      const img = new Image();
      img.onload = () => {
        virtualCanvas.width = img.width;
        virtualCanvas.height = img.height;

        // Tạo stream từ canvas
        const stream = virtualCanvas.captureStream(fps);

        // Sử dụng codec H.264 cho MP4
        const mimeType = MediaRecorder.isTypeSupported(
          'video/mp4; codecs="avc1.42E01E"'
        )
          ? 'video/mp4; codecs="avc1.42E01E"'
          : MediaRecorder.isTypeSupported('video/webm; codecs="vp9"')
          ? 'video/webm; codecs="vp9"'
          : "video/webm";

        console.log(`Using mimeType: ${mimeType}`);

        const mediaRecorder = new MediaRecorder(stream, {
          mimeType: mimeType,
          videoBitsPerSecond: 8000000,
        });

        const chunks = [];
        mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) {
            chunks.push(e.data);
          }
        };

        mediaRecorder.onstop = () => {
          const blob = new Blob(chunks, {
            type: mimeType.includes("mp4") ? "video/mp4" : "video/webm",
          });
          resolve(blob);
        };

        mediaRecorder.onerror = (e) => {
          console.error("MediaRecorder error:", e);
          reject(new Error("MediaRecorder error"));
        };

        let currentFrame = 0;
        mediaRecorder.start();

        const drawNextFrame = () => {
          if (currentFrame >= frames.length) {
            setTimeout(() => {
              if (mediaRecorder.state === "recording") {
                mediaRecorder.stop();
              }
            }, 100);
            return;
          }

          const frameImg = new Image();
          frameImg.onload = () => {
            // Vẽ frame lên canvas
            ctx.clearRect(0, 0, virtualCanvas.width, virtualCanvas.height);
            ctx.drawImage(
              frameImg,
              0,
              0,
              virtualCanvas.width,
              virtualCanvas.height
            );

            currentFrame++;

            if (currentFrame < frames.length) {
              setTimeout(drawNextFrame, 1000 / fps);
            } else {
              setTimeout(() => {
                if (mediaRecorder.state === "recording") {
                  mediaRecorder.stop();
                }
              }, 100);
            }
          };

          frameImg.onerror = () => {
            console.warn(`Failed to load frame ${currentFrame}, skipping...`);
            currentFrame++;
            if (currentFrame < frames.length) {
              setTimeout(drawNextFrame, 1000 / fps);
            } else {
              setTimeout(() => {
                if (mediaRecorder.state === "recording") {
                  mediaRecorder.stop();
                }
              }, 100);
            }
          };

          frameImg.src = frames[currentFrame];
        };

        drawNextFrame();
      };

      img.onerror = () => {
        reject(new Error("Failed to load first frame"));
      };

      img.src = frames[0];
    } catch (error) {
      reject(error);
    }
  });
}

// Main Component với Recording hoàn chỉnh
function SkeletonViewerWithPool({
  source,
  JsonPose,
  modelScale,
  modelOptions = DEFAULT_MODEL_OPTIONS,
}) {
  const [peopleFrames, setPeopleFrames] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadedModelsCount, setLoadedModelsCount] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [characters, setCharacters] = useState([]);

  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const totalFramesRef = useRef(0);
  const recordingFrameRef = useRef(0);

  const { preloadModels } = useModelPool();

  // Recording hook
  const {
    isRecording,
    isProcessing,
    recordingProgress,
    recordedFramesCount,
    startRecording,
    captureFrame,
    stopRecording,
  } = useFullRecording();

  // Preload models
  useEffect(() => {
    const modelUrls = modelOptions.map((opt) => opt.value);
    console.log("🎯 Starting model preloading...", modelUrls);
    preloadModels(modelUrls, 2);
  }, [modelOptions, preloadModels]);

  // Initialize characters
  useEffect(() => {
    const defaultModel = source || DEFAULT_MODEL_OPTIONS[0].value;

    if (characters.length === 0) {
      const initialCharacters = [
        {
          model: defaultModel,
          scale: modelScale || 1.0,
          isLoading: false,
        },
      ];
      setCharacters(initialCharacters);
      setIsLoading(true);
    }
  }, [source, modelScale]);

  // Update characters khi peopleFrames changes
  useEffect(() => {
    if (peopleFrames.length > 0) {
      const updatedCharacters = peopleFrames.map((_, index) => ({
        ...(characters[index] || {
          model: source || DEFAULT_MODEL_OPTIONS[0].value,
          scale: modelScale || 1.0,
          isLoading: false,
        }),
      }));
      setCharacters(updatedCharacters);
    }
  }, [peopleFrames.length]);

  // Parse JSON pose data
  useEffect(() => {
    console.log("📊 Parsing JSON pose data...");
    if (!JsonPose) return;

    if (JsonPose.poses_3d) {
      const transformedData = JsonPose.poses_3d.map((personFrames) =>
        personFrames.map((frame) => frame.map((p) => [-p[0], -p[2], p[1]]))
      );
      setPeopleFrames(transformedData);
      if (transformedData.length > 0 && transformedData[0].length > 0) {
        totalFramesRef.current = transformedData[0].length;
        console.log(
          `📈 Loaded ${transformedData.length} characters with ${totalFramesRef.current} frames`
        );
      }
    }
  }, [JsonPose]);

  // Handle model loading
  const handleModelLoadStart = (characterIndex) => {
    setCharacters((prev) =>
      prev.map((char, index) =>
        index === characterIndex ? { ...char, isLoading: true } : char
      )
    );
  };

  const handleModelLoadComplete = (characterIndex) => {
    setCharacters((prev) =>
      prev.map((char, index) =>
        index === characterIndex ? { ...char, isLoading: false } : char
      )
    );
    setLoadedModelsCount((prev) => prev + 1);
  };

  // Check if all models are loaded
  useEffect(() => {
    if (
      isLoading &&
      peopleFrames.length > 0 &&
      loadedModelsCount >= peopleFrames.length
    ) {
      setIsLoading(false);
      console.log("✅ All models loaded successfully!");
    }
  }, [loadedModelsCount, peopleFrames.length, isLoading]);

  // Animation loop chính - ĐÃ SỬA LỖI HOÀN TOÀN
  useEffect(() => {
    if (!isPlaying || peopleFrames.length === 0 || isLoading) return;

    let lastTime = null;
    let frameCount = currentFrame;

    const animate = (timestamp) => {
      if (!lastTime) lastTime = timestamp;
      const delta = timestamp - lastTime;

      if (delta > (1000 / 30) * (1 / playbackSpeed)) {
        frameCount++;

        // TỰ ĐỘNG DỪNG khi đến frame cuối cùng
        if (frameCount >= totalFramesRef.current) {
          console.log("⏹️ Auto-stopped at the end of animation");
          setIsPlaying(false);
          setCurrentFrame(totalFramesRef.current - 1);

          // Capture frame cuối cùng nếu đang recording
          if (isRecording && canvasRef.current) {
            setTimeout(() => {
              captureFrame(canvasRef.current, totalFramesRef.current - 1);
            }, 150);
          }
          return;
        }

        setCurrentFrame(frameCount);
        lastTime = timestamp;

        // Capture frame nếu đang recording
        if (isRecording && canvasRef.current) {
          setTimeout(() => {
            captureFrame(canvasRef.current, frameCount);
          }, 100);
        }
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [
    isPlaying,
    peopleFrames.length,
    playbackSpeed,
    isLoading,
    isRecording,
    captureFrame,
  ]);

  // Recording handlers - ĐÃ SỬA LỖI
  const handleStartRecording = useCallback(() => {
    if (!totalFramesRef.current || totalFramesRef.current === 0) {
      alert("Không có dữ liệu animation để ghi!");
      return;
    }

    console.log("🎥 Starting automatic recording...");

    // Callback khi recording hoàn thành
    const onRecordingComplete = (videoBlob) => {
      if (videoBlob) {
        downloadVideo(videoBlob);
        console.log("✅ Recording completed and video downloaded");
      } else {
        console.error("❌ Recording failed");
        alert("Có lỗi xảy ra khi ghi video");
      }
    };

    // Reset về frame 0
    setCurrentFrame(0);
    recordingFrameRef.current = 0;

    // Bắt đầu recording
    startRecording(totalFramesRef.current, onRecordingComplete);

    // Đợi một chút rồi bắt đầu play để đảm bảo canvas ready
    setTimeout(() => {
      console.log("▶️ Starting animation playback for recording...");
      setIsPlaying(true);
    }, 500);
  }, [startRecording]);

  const handleStopRecording = useCallback(async () => {
    console.log("⏹️ Manual stop recording requested");
    setIsPlaying(false);
    const videoBlob = await stopRecording();

    if (videoBlob) {
      downloadVideo(videoBlob);
    }
  }, [stopRecording]);

  const downloadVideo = (blob) => {
    const extension = blob.type.includes("mp4") ? "mp4" : "webm";
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `animation_${Date.now()}.${extension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    console.log(`📥 ${extension.toUpperCase()} video downloaded successfully`);
  };

  const handleCharacterChange = (updatedCharacters) => {
    console.log("🔄 Updating character configurations...");
    setIsLoading(true);
    setLoadedModelsCount(0);
    setCharacters(updatedCharacters);
    setTimeout(() => setIsLoading(false), 150);
  };

  const handlePlayPause = () => {
    if (isLoading) return;

    if (!isPlaying && currentFrame >= totalFramesRef.current - 1) {
      // Nếu đang ở frame cuối, bắt đầu lại từ đầu
      setCurrentFrame(0);
    }

    setIsPlaying(!isPlaying);
  };

  const handleFrameChange = (e) => {
    if (isLoading) return;
    const frame = parseInt(e.target.value);
    setCurrentFrame(frame);
  };

  const handleSpeedChange = (e) => {
    const newSpeed = parseFloat(e.target.value);
    setPlaybackSpeed(newSpeed);
  };

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      setIsFullscreen(true);
    } else {
      setIsFullscreen(false);
    }
  };

  // Cleanup
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`${
        isFullscreen
          ? "fixed inset-16 z-50 bg-white border rounded-lg shadow-xl"
          : "w-full relative"
      }`}
    >
      {/* Recording Indicators */}
      {(isRecording || isProcessing) && (
        <div className="absolute top-4 left-4 z-50">
          {isRecording && (
            <div className="bg-red-500 text-white px-4 py-2 rounded-lg flex items-center gap-3 shadow-lg">
              <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
              <span className="text-sm font-medium">Đang ghi MP4</span>
              <span className="text-sm">
                {recordedFramesCount}/{totalFramesRef.current} frames
              </span>
              <span className="text-sm">{Math.round(recordingProgress)}%</span>
            </div>
          )}
          {isProcessing && (
            <div className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center gap-3 shadow-lg">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm font-medium">Đang xử lý MP4...</span>
            </div>
          )}
        </div>
      )}

      {/* Canvas container */}
      <div
        className={`${
          isFullscreen
            ? "w-full h-full bg-white"
            : "w-full border rounded-xl overflow-hidden aspect-video bg-white"
        } relative`}
      >
        {isLoading && <LoadingSpinner />}

        {characters.length === 0 && !isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <div className="text-center p-8">
              <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                Chưa có Model nào được chọn
              </h3>
              <p className="text-gray-500 mb-6">
                Vui lòng chọn một model 3D để bắt đầu hiển thị animation
              </p>
            </div>
          </div>
        )}

        <Canvas
          ref={canvasRef}
          shadows
          camera={{ position: [0, 2, 2], fov: 100 }}
          gl={{
            preserveDrawingBuffer: true,
            alpha: false,
            antialias: true,
          }}
          style={{ background: "#FFFFFF" }}
        >
          <color attach="background" args={["#FFFFFF"]} />

          <ambientLight intensity={0.6} />
          <directionalLight
            position={[5, 5, 5]}
            intensity={1}
            castShadow
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
            shadow-camera-left={-10}
            shadow-camera-right={10}
            shadow-camera-top={10}
            shadow-camera-bottom={-10}
            shadow-camera-near={0.5}
            shadow-camera-far={50}
          />
          <hemisphereLight
            skyColor={0xffffff}
            groundColor={0x444444}
            intensity={0.5}
          />

          {peopleFrames.map((personFrames, index) => (
            <group
              key={index}
              position={[(index - (peopleFrames.length - 1) / 2) * 1.5, 0, 0]}
            >
              {characters[index] && (
                <AnimatedCharacter
                  source={characters[index].model}
                  frames={personFrames}
                  currentFrame={currentFrame}
                  isPlaying={isPlaying}
                  modelScale={characters[index].scale}
                  onLoadStart={() => handleModelLoadStart(index)}
                  onLoadComplete={() => handleModelLoadComplete(index)}
                  characterIndex={index}
                />
              )}
            </group>
          ))}

          <SimpleOrbitControls
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
          />
          <gridHelper args={[5, 10]} />
        </Canvas>
      </div>

      {/* Video-like playback controls */}
      <div className={`w-full absolute bottom-4 p-4`}>
        <div className="flex flex-col space-y-4">
          {/* Control buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center justify-center gap-2 sm:gap-4">
              <button
                onClick={handlePlayPause}
                disabled={isLoading || characters.length === 0 || isRecording}
                className={`p-2 rounded-lg border border-gray-300 transition-colors duration-200 ${
                  isLoading || characters.length === 0 || isRecording
                    ? "bg-gray-100 cursor-not-allowed opacity-50"
                    : "hover:bg-gray-50"
                }`}
              >
                {isPlaying ? (
                  <Pause className="w-4 h-4" />
                ) : (
                  <Play className="w-4 h-4" />
                )}
              </button>

              <span className="text-sm text-gray-600 w-16 text-nowrap">
                {currentFrame} / {totalFramesRef.current - 1}
                {isLoading && " (Đang tải...)"}
              </span>
            </div>

            {/* Recording and other controls */}
            <div className="flex items-center gap-2">
              {/* Recording button */}
              {!isRecording && !isProcessing ? (
                <button
                  onClick={handleStartRecording}
                  disabled={
                    isLoading ||
                    characters.length === 0 ||
                    totalFramesRef.current === 0
                  }
                  className={`px-3 py-2 rounded-lg border transition-all duration-200 flex items-center gap-2 ${
                    isLoading ||
                    characters.length === 0 ||
                    totalFramesRef.current === 0
                      ? "bg-gray-100 cursor-not-allowed opacity-50 border-gray-300 text-gray-500"
                      : "border-red-500 bg-red-500 hover:bg-red-600 text-white shadow-md hover:shadow-lg"
                  }`}
                  title="Ghi toàn bộ animation thành MP4 (tự động dừng)"
                >
                  <Circle className="w-4 h-4" />
                  <span className="text-sm">Ghi MP4</span>
                </button>
              ) : isRecording ? (
                <button
                  onClick={handleStopRecording}
                  className="px-3 py-2 rounded-lg border border-red-500 bg-white hover:bg-red-50 text-red-500 transition-all duration-200 flex items-center gap-2 shadow-md hover:shadow-lg"
                  title="Dừng ghi ngay"
                >
                  <Square className="w-4 h-4" />
                  <span className="text-sm">Dừng Ghi</span>
                </button>
              ) : null}

              <button
                onClick={() => setShowSettings(!showSettings)}
                disabled={characters.length === 0 || isRecording}
                className={`p-2 rounded-lg border border-gray-300 transition-colors duration-200 ${
                  characters.length === 0 || isRecording
                    ? "bg-gray-100 cursor-not-allowed opacity-50"
                    : "hover:bg-gray-50"
                }`}
                title="Cài đặt nhân vật"
              >
                <Settings className="w-4 h-4 text-gray-600" />
              </button>

              <button
                onClick={toggleFullscreen}
                className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors duration-200"
                title={isFullscreen ? "Thu nhỏ" : "Phóng to"}
              >
                {isFullscreen ? (
                  <Minimize className="w-4 h-4 text-gray-600" />
                ) : (
                  <Maximize className="w-4 h-4 text-gray-600" />
                )}
              </button>

              <select
                value={playbackSpeed.toString()}
                onChange={handleSpeedChange}
                disabled={isLoading || characters.length === 0 || isRecording}
                className={`text-sm border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  isLoading || characters.length === 0 || isRecording
                    ? "bg-gray-100 cursor-not-allowed opacity-50"
                    : "bg-white"
                }`}
              >
                <option value="0.25">0.25x</option>
                <option value="0.5">0.5x</option>
                <option value="1">1x</option>
                <option value="1.5">1.5x</option>
                <option value="2">2x</option>
              </select>
            </div>
          </div>

          {/* Timeline slider */}
          <div className="flex items-center space-x-4">
            <input
              type="range"
              min="0"
              max={Math.max(0, totalFramesRef.current - 1)}
              value={currentFrame}
              onChange={handleFrameChange}
              disabled={isLoading || characters.length === 0 || isRecording}
              className={`flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-thumb ${
                isLoading || characters.length === 0 || isRecording
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }`}
            />
          </div>
        </div>
      </div>

      {/* Character Settings Panel */}
      {showSettings && (
        <CharacterSettingsPanel
          characters={characters}
          onCharacterChange={handleCharacterChange}
          onClose={() => setShowSettings(false)}
          modelOptions={modelOptions}
        />
      )}

      <style jsx>{`
        .slider-thumb::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: 2px solid #ffffff;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }

        .slider-thumb::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: 2px solid #ffffff;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }

        .slider-thumb:disabled::-webkit-slider-thumb {
          background: #9ca3af;
          cursor: not-allowed;
        }

        .slider-thumb:disabled::-moz-range-thumb {
          background: #9ca3af;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}

// Export component với ModelPoolProvider
export default function SkeletonViewer(props) {
  return (
    <ModelPoolProvider>
      <SkeletonViewerWithPool {...props} />
    </ModelPoolProvider>
  );
}
