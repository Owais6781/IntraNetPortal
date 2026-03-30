import * as React from "react";
import { IIntranetPortalProps } from "../IIntranetPortalProps";
import "@pnp/sp/lists";
import "@pnp/sp/items";
import "@pnp/sp/folders";
import "@pnp/sp/files";
import {
  Folder,
  FileText,
  FileSignature,
  File,
  Download,
  ExternalLink,
  FileImage,

} from "lucide-react";

interface DocFile {
  id: number;
  name: string;
  fileUrl: string;
  documentCategory: string[];
  status: string;
}

const Knowledge: React.FC<IIntranetPortalProps> = ({ sp }) => {
  const [knowledge, setKnowledge] = React.useState<DocFile[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [showAll, setShowAll] = React.useState(false);

  // ---------- FETCH DATA ----------
  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const items = await sp.web.lists
        .getByTitle("KnowledgeBase")
        .items.select(
          "Id",
          "FileLeafRef",
          "FileRef",
          "DocumentCategory",
          "Status"
        )();

      const mapped: DocFile[] = items.map((i: any) => ({
        id: i.Id,
        name: i.FileLeafRef,
        fileUrl: i.FileRef,
        // Fixed typo: DocmentCategory -> DocumentCategory
        documentCategory: Array.isArray(i.DocumentCategory)
          ? i.DocumentCategory
          : i.DocumentCategory
            ? [i.DocumentCategory]
            : ["Other"], // Default if null
        status: i.Status,
      }));

      setKnowledge(mapped.filter((d) => d.status === "Active"));
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    void fetchDocuments();
  }, [sp]);

  // ---------- GROUP DATA ----------
  const GroupDocument: Record<string, DocFile[]> = {};

  knowledge.forEach((document) => {
    document.documentCategory.forEach((category) => {
      if (!GroupDocument[category]) {
        GroupDocument[category] = [];
      }
      GroupDocument[category].push(document);
    });
  });

  // ---------- ICONS ----------
  const getFileIcon = (fileName?: string) => {
    const ext = fileName?.split(".").pop()?.toLowerCase();
    switch (ext) {
      case "pdf":
        return <FileText className="text-red-500" size={18} />;
      case "doc":
      case "docx":
        return <FileText className="text-blue-500" size={18} />;
      case "ppt":
      case "pptx":
        return <FileSignature className="text-orange-500" size={18} />;
      case "jpg":
      case "jpeg":
      case "png":
      case "gif":
        return <FileImage className="text-purple-500" size={18} />;
      default:
        return <File className="text-gray-500" size={18} />;
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-zinc-50 to-emerald-50 px-4 py-10">
      <div className="max-w-7xl mx-auto mb-10">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-semibold text-zinc-900 tracking-tight mb-2">
              Knowledge Base
            </h1>
            <p className="text-sm md:text-base text-zinc-600 whitespace-nowrap overflow-hidden text-ellipsis">
              Access centralized documentation, templates, and technical guides for your organization.
            </p>
          </div>
        </div>
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-10 h-10 border-4 border-emerald-200 border-t-emerald-500 rounded-full animate-spin mb-4"></div>
          <p className="text-zinc-500 text-sm">Loading Knowledge Base...</p>
        </div>
      )}

      {!loading && knowledge.length === 0 && (
        <div className="max-w-7xl mx-auto flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-zinc-200 rounded-2xl bg-white/50">
          <Folder size={48} className="text-zinc-300 mb-4" />
          <p className="text-lg font-medium text-zinc-600">No documents found</p>
          <p className="text-zinc-500 mt-1">Check back later for updates.</p>
        </div>
      )}

      {/* Content – Cards Horizontal / Vertical */}
      {!loading && knowledge.length > 0 && (
        <div className="max-w-7xl mx-auto flex flex-wrap gap-6 justify-center  ">
          {Object.entries(GroupDocument).map(([category, items]) => (
            <div
              key={category}
              className="bg-white/90 backdrop-blur-sm border border-zinc-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-200 p-6 flex flex-col w-[300px] "
            >
              {/* Header */}
              <div className="flex items-center gap-3 mb-4 pb-2 border-b border-zinc-100">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <Folder size={20} />
                </div>
                <div className="overflow-hidden">
                  <h3 className="text-sm font-bold text-zinc-900 truncate  tracking-wide">
                    {category}
                  </h3>
                  <p className="text-xs text-zinc-500">
                    {items.length} file{items.length !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>

              {/* Files */}
              <div className={`flex-1 pr-2 custom-scrollbar ${showAll ? "overflow-y-auto max-h-[220px]" : "overflow-hidden"
                }`}>
                <ul className="flex flex-col gap-2 ">
                  {items.slice(0, showAll ? items.length : 3).map((item) => (
                    <li
                      key={item.id}
                      className="flex items-center justify-between p-2.5 rounded-lg bg-zinc-50 hover:bg-emerald-50 border border-transparent hover:border-emerald-200 transition-all duration-200 group"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0 mr-2">
                        {getFileIcon(item.name)}
                        <a
                          href={item.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-zinc-700 hover:text-emerald-700 truncate font-medium text-sm w-full"
                          title={item.name}
                        >
                          {item.name}
                        </a>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">

                      {/* <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"> */}
                        <a
                          href={item.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-md hover:bg-white text-zinc-400 hover:text-emerald-600 transition-colors"
                          title="Open"
                        >
                          <ExternalLink size={14} />
                        </a>
                        <a
                          href={item.fileUrl}
                          download
                          className="p-1.5 rounded-md hover:bg-white text-zinc-400 hover:text-emerald-600 transition-colors"
                          title="Download"
                        >
                          <Download size={14} />
                        </a>
                      </div>
                    </li>
                  ))}
                  {items.length > 3 && (
                    <div className="flex justify-center pt-4 flex-shrink-0  ">
                      <button
                        onClick={() => setShowAll(!showAll)}
                        className="bg-gradient-to-r from-gray-200 to-gray-300 hover:from-gray-300 hover:to-gray-400 text-gray-700 px-8 py-3 rounded-xl font-semibold transition-all duration-300 hover:shadow-md"
                      >
                        {showAll ? "Show Less" : "More"}
                      </button>
                    </div>
                  )}
                </ul>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Knowledge;
