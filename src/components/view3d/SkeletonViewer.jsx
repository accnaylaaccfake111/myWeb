"use client";
import { useEffect, useState, useRef } from "react";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";
import { Maximize, Minimize, Pause, Play } from "lucide-react";

// Define skeleton connections (hip, knee, etc.) for visualization
const COCO17_CONNECTIONS = [
    [0, 1, "", "#1f77b4"],
    [1, 2, "mixamorigLeftUpLeg", "#aec7e8"],
    [2, 3, "mixamorigLeftLeg", "#ff7f0e"],
    [2, 2, "mixamorigLeftFoot", "#c7c7c7"],
    [0, 4, "", "#ffbb78"],
    [4, 5, "mixamorigRightUpLeg", "#2ca02c"],
    [5, 6, "mixamorigRightLeg", "#98df8a"],
    [6, 6, "mixamorigRightFoot", "#e377c2"],
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

// Encapsulates all logic for a single animated character
function AnimatedCharacter({ source, frames, currentFrame, modelScale }) {
    const groupRef = useRef();
    const [model, setModel] = useState(null);
    const [bones, setBones] = useState(null);

    // Load and prepare the model
    useEffect(() => {
        if (!source) return;

        const loader = source.endsWith(".fbx")
            ? new FBXLoader()
            : new GLTFLoader();

        loader.load(
            source,
            (loadedModel) => {
                const m = loadedModel.scene || loadedModel;
                m.position.y += 1 * (modelScale || 1);
                m.position.z -= 1 * (modelScale || 1);
                m.scale.set(modelScale || 1, modelScale || 1, modelScale || 1);
                m.traverse((child) => {
                    if (child.isMesh) {
                        child.castShadow = true;
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
                setModel(m);
            },
            undefined,
            (error) => {
                console.error("Error loading model:", error);
            },
        );
    }, [source]);

    // Animate the model based on current frame
    useFrame(() => {
        if (!frames?.length || !bones || !model || currentFrame === undefined)
            return;

        const frame = frames[currentFrame];
        if (!frame) return;

        COCO17_CONNECTIONS.forEach(([i, j, boneName]) => {
            if (boneName && bones[boneName]) {
                const bone = bones[boneName];

                const p1 = new THREE.Vector3(
                    -frame[i][0],
                    -frame[i][2],
                    -frame[i][1],
                );
                const p2 =
                    i === j && (i === 2 || i === 6)
                        ? new THREE.Vector3(
                              -frame[i][0],
                              -frame[i][2] - 0.5,
                              -frame[i][1],
                          )
                        : new THREE.Vector3(
                              -frame[j][0],
                              -frame[j][2],
                              -frame[j][1],
                          );

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
                    dir,
                );

                bone.quaternion.slerp(targetQuat, 0.1);
            }
        });

        ROTATE_CONNECTIONS.forEach(([i, j, boneName]) => {
            if (boneName && bones[boneName]) {
                const bone = bones[boneName];

                const p1 = new THREE.Vector3(
                    -frame[i][0],
                    -frame[i][2],
                    -frame[i][1],
                );
                const p2 = new THREE.Vector3(
                    -frame[j][0],
                    -frame[j][2],
                    -frame[j][1],
                );

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
                    dir,
                );

                bone.quaternion.slerp(targetQuat, 0.1);
            }
        });
    });

    return model ? <primitive object={model} ref={groupRef} /> : null;
}

export default function SkeletonViewer({ source, JsonPose, modelScale }) {
    const [peopleFrames, setPeopleFrames] = useState([]);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentFrame, setCurrentFrame] = useState(0);
    const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const containerRef = useRef(null);
    const animationRef = useRef(null);
    const totalFramesRef = useRef(0);

    useEffect(() => {
        console.log(JsonPose);
        if (!JsonPose) return;
        if (JsonPose.poses_3d) {
            const transformedData = JsonPose.poses_3d.map((personFrames) =>
                personFrames.map((frame) =>
                    frame.map((p) => [-p[0], -p[2], p[1]]),
                ),
            );
            setPeopleFrames(transformedData);
            if (transformedData.length > 0 && transformedData[0].length > 0) {
                totalFramesRef.current = transformedData[0].length;
            }
        }
    }, [JsonPose]);

    // Animation loop
    useEffect(() => {
        if (!isPlaying || peopleFrames.length === 0) return;

        let lastTime = null;

        const animate = (timestamp) => {
            if (!lastTime) lastTime = timestamp;
            const delta = timestamp - lastTime;

            if (delta > (1000 / 30) * (1 / playbackSpeed)) {
                // 30 FPS base
                setCurrentFrame((prev) => {
                    const nextFrame = prev + 1;
                    return nextFrame >= totalFramesRef.current ? 0 : nextFrame;
                });
                lastTime = timestamp;
            }

            animationRef.current = requestAnimationFrame(animate);
        };

        animationRef.current = requestAnimationFrame(animate);

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [isPlaying, peopleFrames.length, playbackSpeed]);

    const handlePlayPause = () => {
        setIsPlaying(!isPlaying);
    };

    const handleFrameChange = (e) => {
        const frame = parseInt(e.target.value);
        setCurrentFrame(frame);
    };

    const handleSpeedChange = (e) => {
        console.log(playbackSpeed.toString());
        setPlaybackSpeed(parseFloat(e.target.value));
    };

    const toggleFullscreen = () => {
        if (!isFullscreen) {
            setIsFullscreen(true);
        } else {
            setIsFullscreen(false);
        }
    };

    return (
        <div
            ref={containerRef}
            className={`${
                isFullscreen
                    ? "fixed inset-16 z-50 bg-white border rounded-lg shadow-xl"
                    : "w-full relative"
            }`}
        >
            {/* Canvas container */}
            <div
                className={`${
                    isFullscreen
                        ? "w-full h-full"
                        : "w-full border rounded-xl overflow-hidden aspect-video"
                }`}
            >
                <Canvas shadows camera={{ position: [0, 2, 2], fov: 100 }}>
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
                            position={[
                                (index - (peopleFrames.length - 1) / 2) * 1.5,
                                0,
                                0,
                            ]}
                        >
                            {source && (
                                <AnimatedCharacter
                                    source={source}
                                    frames={personFrames}
                                    currentFrame={currentFrame}
                                    isPlaying={isPlaying}
                                    modelScale={modelScale}
                                />
                            )}
                        </group>
                    ))}

                    <OrbitControls />
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
                                className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors duration-200"
                            >
                                {isPlaying ? (
                                    <Pause className="w-4 h-4" />
                                ) : (
                                    <Play className="w-4 h-4" />
                                )}
                            </button>

                            <span className="text-sm text-gray-600 w-16 text-nowrap">
                                {currentFrame} / {totalFramesRef.current - 1}
                            </span>
                        </div>

                        {/* Speed control */}
                        <div className="flex items-center gap-2">
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
                                className="text-sm border rounded-lg p-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                            className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider-thumb"
                        />
                    </div>
                </div>
            </div>

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
            `}</style>
        </div>
    );
}
