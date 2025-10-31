import { useEffect, useState } from "react";
import SkeletonViewer from "../components/view3d/SkeletonViewer";
import { JsonPose } from "../components/view3d/dfData";
import MusicXMLViewer from "../components/MusicXMLViewer";

const DancePreview = () => {
    const [xmlData, setXmlData] = useState(null);

    useEffect(() => {
        const loadXML = async () => {
            try {
                const response = await fetch("/choixuan.xml");
                const text = await response.text();
                setXmlData(text);
            } catch (error) {
                console.error("Lỗi khi tải XML:", error);
            }
        };

        loadXML();
    }, []);

    return (
        <div className="max-w-4xl mx-auto">
            {xmlData ? (
                <MusicXMLViewer src={xmlData} editable={true} />
            ) : (
                <p className="text-gray-500 text-center">Đang tải dữ liệu...</p>
            )}

            {/* <h1 className="text-2xl font-bold text-gray-800 mb-6">
                Mô phỏng điệu múa
            </h1>

            <div className="bg-white rounded-xl p-6 shadow-md">
                <SkeletonViewer
                    source="/models/aobabamerge.fbx"
                    JsonPose={JsonPose}
                    modelScale={0.01}
                />
            </div> */}
        </div>
    );
};

export default DancePreview;
