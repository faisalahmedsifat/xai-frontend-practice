import ToggleButton from "@/components/level1/ToggleButton";

export default function Home() {
  return (
    <main className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">TaskFlow Challenge</h1>
      
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Level 1: Toggle Button</h2>
        <ToggleButton text="Click to toggle this text" className="bg-blue-500 text-white p-2 rounded" />
      </section>
      
      {/* 
        As you progress through the levels, uncomment and implement these sections
        
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Level 2: Task Management</h2>
          {/* <TaskForm onAddTask={(task) => console.log('New task:', task)} /> */}
          {/* <TaskDisplay tasks={[]} /> */}
        {/* </section> */}
        
        {/* Additional level sections will be added as you progress */}
      {/* */}
    </main>
  );
}
