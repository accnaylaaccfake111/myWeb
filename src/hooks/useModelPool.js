// hooks/useModelPool.js
import { useRef, useCallback, useContext, createContext } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";

const ModelPoolContext = createContext();

export function ModelPoolProvider({ children }) {
    const pool = useRef(new Map()); // Map<modelUrl, THREE.Group[]>
    const loadingPromises = useRef(new Map()); // Map<modelUrl, Promise>

    // Preload models vào pool
    const preloadModels = useCallback((modelUrls, poolSize = 2) => {
        console.log("🔄 Preloading models into pool:", modelUrls);
        modelUrls.forEach((url) => {
            if (!pool.current.has(url)) {
                pool.current.set(url, []);
                loadModelBatch(url, poolSize);
            }
        });
    }, []);

    // Load một batch models vào pool
    const loadModelBatch = useCallback(async (modelUrl, count) => {
        const loader = modelUrl.endsWith(".fbx")
            ? new FBXLoader()
            : new GLTFLoader();

        console.log(`📦 Loading ${count} instances of ${modelUrl} into pool`);

        for (let i = 0; i < count; i++) {
            try {
                const model = await new Promise((resolve, reject) => {
                    loader.load(
                        modelUrl,
                        (loadedModel) => {
                            const modelInstance =
                                loadedModel.scene || loadedModel;
                            modelInstance.visible = false; // Ẩn khi chưa dùng

                            // Clone materials để tránh sharing issues
                            modelInstance.traverse((child) => {
                                if (child.isMesh) {
                                    child.material = child.material.clone();
                                    child.castShadow = true;
                                    child.receiveShadow = true;
                                }
                            });

                            resolve(modelInstance);
                        },
                        // Progress callback
                        (progress) => {
                            console.log(
                                `Loading ${modelUrl}: ${(
                                    (progress.loaded / progress.total) *
                                    100
                                ).toFixed(1)}%`,
                            );
                        },
                        // Error callback
                        reject,
                    );
                });

                pool.current.get(modelUrl).push(model);
                console.log(
                    `✅ Added instance ${i + 1} to pool for ${modelUrl}`,
                );
            } catch (error) {
                console.error(
                    `❌ Failed to load model for pool: ${modelUrl}`,
                    error,
                );
            }
        }
    }, []);

    // Lấy model từ pool
    const getModelFromPool = useCallback((modelUrl) => {
        const modelPool = pool.current.get(modelUrl);

        if (!modelPool || modelPool.length === 0) {
            // Nếu pool trống, tạo model mới ngay lập tức
            console.warn(`⚠️ Pool empty for ${modelUrl}, loading new instance`);
            return loadSingleModel(modelUrl);
        }

        // Lấy model từ pool
        const model = modelPool.pop();
        model.visible = true;
        console.log(
            `🎯 Retrieved model from pool for ${modelUrl}, remaining: ${modelPool.length}`,
        );
        return Promise.resolve(model);
    }, []);

    // Load single model (fallback khi pool trống)
    const loadSingleModel = useCallback((modelUrl) => {
        const loader = modelUrl.endsWith(".fbx")
            ? new FBXLoader()
            : new GLTFLoader();

        console.log(`🔥 Loading new instance (not from pool): ${modelUrl}`);

        return new Promise((resolve, reject) => {
            loader.load(
                modelUrl,
                (loadedModel) => {
                    const modelInstance = loadedModel.scene || loadedModel;
                    resolve(modelInstance);
                },
                undefined,
                reject,
            );
        });
    }, []);

    // Trả model về pool
    const returnModelToPool = useCallback((modelUrl, model) => {
        if (!model || !modelUrl) return;

        if (!pool.current.has(modelUrl)) {
            pool.current.set(modelUrl, []);
        }

        // Reset model state
        model.visible = false;
        model.position.set(0, 0, 0);
        model.rotation.set(0, 0, 0);
        model.scale.set(1, 1, 1);

        // Reset bone rotations và animations
        model.traverse((child) => {
            if (child.isBone) {
                child.rotation.set(0, 0, 0);
                child.position.set(0, 0, 0);
                child.scale.set(1, 1, 1);
            }
        });

        pool.current.get(modelUrl).push(model);
        console.log(
            `♻️ Returned model to pool for ${modelUrl}, total: ${
                pool.current.get(modelUrl).length
            }`,
        );
    }, []);

    // Cleanup pool
    const cleanupPool = useCallback(() => {
        console.log("🧹 Cleaning up model pool");
        pool.current.forEach((modelPool, url) => {
            modelPool.forEach((model) => {
                model.traverse((child) => {
                    if (child.isMesh) {
                        child.geometry?.dispose();
                        child.material?.dispose();
                    }
                });
            });
        });
        pool.current.clear();
    }, []);

    // Get pool statistics
    const getPoolStats = useCallback(() => {
        const stats = {};
        pool.current.forEach((models, url) => {
            const filename = url.split("/").pop();
            stats[filename] = models.length;
        });
        return stats;
    }, []);

    return (
        <ModelPoolContext.Provider
            value={{
                preloadModels,
                getModelFromPool,
                returnModelToPool,
                cleanupPool,
                getPoolStats,
            }}
        >
            {children}
        </ModelPoolContext.Provider>
    );
}

export const useModelPool = () => {
    const context = useContext(ModelPoolContext);
    if (!context) {
        throw new Error("useModelPool must be used within ModelPoolProvider");
    }
    return context;
};
