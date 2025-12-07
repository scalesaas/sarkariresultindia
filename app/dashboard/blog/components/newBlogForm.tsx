import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import "react-quill/dist/quill.snow.css";
import "react-quill/dist/quill.bubble.css";
import { useRouter } from "next/router";
import { createClient } from "@supabase/supabase-js";
import ReactQuill , { Quill } from "react-quill";
import plus from "../../../plus.png";
import video from "../../../video.png";
import external from "../../../external.png";
import imageicon from "../../../image.png";
import supabase from "@/utils/supabase/supabase";
// Quill.register('modules/codeSyntax', CodeSyntax);

const WritePage = () => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const quillRef = useRef<ReactQuill>(null);

  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [media, setMedia] = useState<string>("");
  const [value, setValue] = useState<string>("");
  const [title, setTitle] = useState<string>("");
  const [catSlug, setCatSlug] = useState<string>("");
  const [isSaving, setIsSaving] = useState<boolean>(false);
  console.log(value);

  useEffect(() => {

    const upload = async () => {
      if (file) {
        const { data, error } = await supabase.storage
          .from("uploads")
          .upload(`${new Date().getTime()}-${file.name}`, file);

        if (error) {
          console.error("Error uploading file:", error.message);
        } else {
          setMedia(data.path);
        }
      }
    };

    file && upload();
  }, [file]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [wrapperRef]);

  const slugify = (str: string) =>
    str
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");

  const handleSubmit = async () => {
    setIsSaving(true);

    const { error } = await supabase.from("posts").insert({
      title,
      desc: value,
      img: media,
      slug: slugify(title),
      catSlug: catSlug || "style",
    });

    if (!error) {
      setValue("");
      setTitle("");
      setCatSlug("");
      setMedia("");
    }
    setIsSaving(false);
  };

  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, 4, 5, 6, false] }],
      ["bold", "italic", "underline", "strike", "blockquote"],
      [
        { list: "ordered" },
        { list: "bullet" },
        { indent: "-1" },
        { indent: "+1" },
        { align: [] },
      ],
      ["link", "image", "video"],
      ["clean"],
       ['color'],
       ['code-block'], 
    ],
    // codeSyntax: {
    //   highlight: (text: string, language: string) => {
    //     // Use highlight.js to provide syntax highlighting
    //     return hljs.highlightAuto(text, [language]).value;
    //   },
    //   languages: {
    //     javascript: 'JavaScript',
    //     typescript: 'TypeScript',
    //     python: 'Python',
    //     // Add more languages as needed
    //   },
    //   lineNumbers: true,
    // },
  };

  return (
    <div className="container mx-auto">
      <input
        type="text"
        placeholder="Title"
        className="px-12 py-12 text-6xl border-none outline-none bg-transparent text-gray-800 placeholder-gray-400"
        onChange={(e) => setTitle(e.target.value)}
      />
      <select
        className="ml-12 mb-12 py-2 px-5 w-max"
        onChange={(e) => setCatSlug(e.target.value)}
      >
        <option value="style">style</option>
        <option value="fashion">fashion</option>
        <option value="food">food</option>
        <option value="culture">culture</option>
        <option value="travel">travel</option>
        <option value="coding">coding</option>
      </select>
      <div className="editor relative flex gap-5 h-[700px]">
        <button
          className="button w-9 h-9 rounded-full bg-transparent border border-gray-800 flex items-center justify-center cursor-pointer"
          onClick={() => setOpen(!open)}
        >
          <Image src={plus} alt="" width={16} height={16} />
        </button>
        {open && (
          <div className="add absolute z-50 flex gap-5 bg-white px-12 py-4">
            <input
              type="file"
              id="image"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="hidden"
            />
            <label
              htmlFor="image"
              className="addButton w-9 h-9 rounded-full border border-green-700 flex items-center justify-center cursor-pointer"
            >
              <Image src={imageicon} alt="" width={16} height={16} />
            </label>
            <button className="addButton w-9 h-9 rounded-full border border-green-700 flex items-center justify-center cursor-pointer">
              <Image src={external} alt="" width={16} height={16} />
            </button>
            <button className="addButton w-9 h-9 rounded-full border border-green-700 flex items-center justify-center cursor-pointer">
              <Image src={video} alt="" width={16} height={16} />
            </button>
            <button
              className="addButton w-9 h-9 rounded-full border border-green-700 flex items-center justify-center cursor-pointer"
              onClick={() => setOpen(false)}
            >
              <Image src="/close.png" alt="" width={16} height={16} />
            </button>
          </div>
        )}
        <ReactQuill
          ref={quillRef}
          className="w-full"
          theme="bubble"
          value={value}
          onChange={setValue}
          modules={modules}
          placeholder="Tell your story..."
        />
      </div>
      <button
        className={`publish absolute top-0 right-0 py-2 px-5 border-none text-white cursor-pointer rounded-full ${
          isSaving ? "bg-gray-400" : "bg-green-700"
        }`}
        onClick={handleSubmit}
        disabled={isSaving}
      >
        {isSaving ? "Saving..." : "Publish"}
      </button>
    </div>
  );
};

export default WritePage;