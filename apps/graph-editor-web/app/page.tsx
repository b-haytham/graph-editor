import Editor from "editor/Editor";

export default function Home() {
  return (
    <div className="h-screen w-screen flex flex-col">
      {/*<section className="w-[200px] bg-cyan-100">
        <div className="bg-black h-10" />
      </section>*/}

      <div className="flex-grow h-full">
        <Editor zoomControl />
      </div>
    </div>
  );
}
