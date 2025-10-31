import { Rotate3DIcon } from "lucide-react";

const ProjectSelection = ({
    existingProjects,
    currentProjectPage,
    projectPages,
    onProjectSelect,
    onPageChange,
    navigate,
    isLoading,
}) => {
    const projectsPerPage = 2;
    const currentProjects = existingProjects.slice(
        currentProjectPage * projectsPerPage,
        (currentProjectPage + 1) * projectsPerPage,
    );

    return (
        <div className="w-full px-4 sm:px-6 lg:px-12 pt-2 pb-6 bg-gray-50">
            <h1 className="text-3xl sm:text-4xl font-bold text-red-700 mb-2 text-center animate-pulse">
                Karaoke và Chấm điểm
            </h1>
            <p className="text-gray-600 text-lg text-center mb-8">
                Chọn dự án để bắt đầu hát karaoke
            </p>

            <div className="bg-white rounded-xl p-6 sm:p-8 shadow-lg border border-gray-200">
                {isLoading ? (
                    <div className="h-64 inset-0 flex flex-col justify-center items-center">
                        <Rotate3DIcon className="w-16 h-16 text-gray-600 animate-spin mb-4" />
                        <p className="text-gray-600">Đang tải dự án...</p>
                    </div>
                ) : (
                    <div className="text-center">
                        <div className="mb-6">
                            <div className="w-20 h-20 mx-auto bg-red-50 rounded-full flex items-center justify-center">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-12 w-12 text-red-600"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                                    />
                                </svg>
                            </div>
                        </div>
                        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                            Chọn dự án có sẵn
                        </h2>
                        <p className="text-gray-600 mb-6">
                            Chọn một dự án đã tạo hoặc quay lại sáng tác lời
                        </p>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                            {currentProjects.map((project) => (
                                <ProjectCard
                                    key={project.id}
                                    project={project}
                                    onSelect={onProjectSelect}
                                />
                            ))}
                        </div>

                        {projectPages > 1 && (
                            <Pagination
                                currentPage={currentProjectPage}
                                totalPages={projectPages}
                                onPageChange={onPageChange}
                            />
                        )}

                        <div className="border-t pt-6 mt-4 flex justify-center gap-4">
                            <button
                                onClick={() => navigate("/lyrics-composition")}
                                className="bg-gray-300 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-400 transition-all duration-200 font-semibold shadow-md hover:shadow-lg transform hover:scale-105"
                            >
                                Quay lại sáng tác
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const ProjectCard = ({ project, onSelect }) => (
    <div
        className="border border-gray-300 rounded-lg p-6 hover:bg-red-50 cursor-pointer transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-102 relative"
        onClick={() => onSelect(project)}
    >
        <div className="flex justify-between items-start">
            <div className="flex-1">
                <div className="flex items-center mb-2">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6 text-red-600 mr-2"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
                        />
                    </svg>
                    <h3 className="font-medium text-gray-800 text-lg">
                        {project.name}
                    </h3>
                </div>
                {project.audio && (
                    <div className="flex items-center mt-2 text-green-600">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 mr-1"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15.536 8.464a5 5 0 010 7.072M12 6a9 9 0 010 12m4.5-15.5a13 13 0 010 19M9 9h1.246a1 1 0 01.961.725l1.586 5.55a1 1 0 00.961.725H15"
                            />
                        </svg>
                        <span className="text-xs">Có file nhạc</span>
                    </div>
                )}
            </div>
        </div>
        <p className="text-xs text-gray-500 absolute bottom-2 right-4">
            Ngày tạo: {project.date}
        </p>
    </div>
);

const Pagination = ({ currentPage, totalPages, onPageChange }) => (
    <div className="flex justify-center mt-4 mb-6">
        <div className="flex space-x-2 bg-gray-100 p-1 rounded-lg">
            {Array.from({ length: totalPages }, (_, i) => (
                <button
                    key={i}
                    onClick={() => onPageChange(i)}
                    className={`px-3 py-1 rounded-md text-sm font-medium ${
                        currentPage === i
                            ? "bg-white text-red-600 shadow-sm"
                            : "text-gray-600 hover:text-gray-800"
                    }`}
                >
                    {i + 1}
                </button>
            ))}
        </div>
    </div>
);

export default ProjectSelection;
