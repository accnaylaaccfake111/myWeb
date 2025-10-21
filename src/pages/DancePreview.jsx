import SkeletonViewer from "../components/view3d/SkeletonViewer";
import { JsonPose } from "../components/view3d/dfData";
import MusicXMLViewer from "../components/MusicXMLViewer";

const DancePreview = () => {
    return (
        <div className="max-w-4xl mx-auto">
            {/* <MusicXMLViewer src="/choixuan.xml" /> */}
            <h1 className="text-2xl font-bold text-gray-800 mb-6">
                Mô phỏng điệu múa
            </h1>

            <div className="bg-white rounded-xl p-6 shadow-md">
                <SkeletonViewer
                    source="/models/aobabamerge.fbx"
                    JsonPose={JsonPose}
                    modelScale={0.01}
                />
            </div>
        </div>
    );
};

export default DancePreview;
