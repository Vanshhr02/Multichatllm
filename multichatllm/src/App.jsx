import { useState } from "react";

export default function App() {
  const [prompt, setPrompt] = useState("");
  const [selectedModels, setSelectedModels] = useState([]);
  const [responses, setResponses] = useState({});
  const [loading, setLoading] = useState(false);

  const models = ["ChatGPT", "Gemini", "Claude"];

  const toggleModel = (model) => {
    setSelectedModels((prev) =>
      prev.includes(model) ? prev.filter((m) => m !== model) : [...prev, model]
    );
  };

  const handleSubmit = async () => {
    if (!prompt.trim()) return;
    if (selectedModels.length === 0) {
      alert("Please select at least one model.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, models: selectedModels }),
      });
      const data = await res.json();
      setResponses(data);
    } catch (err) {
      console.error(err);
      alert("Error contacting backend. Check console.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-gray-200 p-6 flex flex-col items-center">
      <div className="w-full max-w-3xl">
        <header className="mb-6 text-center">
          <h1 className="text-3xl font-extrabold text-white">Multi-LLM Chat</h1>
          <p className="text-sm text-gray-400 mt-1">
            Select models, enter a prompt and get responses side-by-side.
          </p>
        </header>

        <section className="bg-gray-900 shadow-md rounded-lg p-6 mb-6 border border-gray-700">
          <label className="block text-sm font-medium text-gray-300 mb-2">Prompt</label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Enter your prompt here..."
            className="w-full rounded-md bg-gray-800 text-gray-200 border-gray-700 shadow-sm focus:ring-2 focus:ring-indigo-400 p-3 mb-4 resize-none min-h-[96px]"
          />

          <div className="mb-4">
            <p className="text-sm font-medium text-gray-300 mb-2">Models</p>
            <div className="flex flex-wrap gap-3">
              {models.map((m) => (
                <label
                  key={m}
                  className={`flex items-center gap-2 px-3 py-2 border rounded-lg cursor-pointer transition
                    ${
                      selectedModels.includes(m)
                        ? "bg-indigo-900 border-indigo-500"
                        : "bg-gray-800 border-gray-700"
                    }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedModels.includes(m)}
                    onChange={() => toggleModel(m)}
                    className="h-4 w-4 text-indigo-400 rounded"
                  />
                  <span className="text-sm font-medium">{m}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleSubmit}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md font-medium shadow"
              disabled={loading}
            >
              {loading ? "Sending..." : "Send"}
            </button>

            <button
              onClick={() => {
                setPrompt("");
                setSelectedModels([]);
                setResponses({});
              }}
              className="px-3 py-2 border rounded-md text-sm text-gray-300 border-gray-700 hover:bg-gray-800"
            >
              Reset
            </button>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3 text-white">Responses</h2>

          {Object.keys(responses).length === 0 ? (
            <div className="text-sm text-gray-400">
              No responses yet. Send a prompt to see results.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(responses).map(([model, text]) => (
                <div
                  key={model}
                  className="bg-gray-900 border border-gray-700 rounded-lg p-4 shadow-sm"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-medium text-white">{model}</h3>
                    <span className="text-xs text-gray-500">model</span>
                  </div>
                  <p className="text-gray-300 whitespace-pre-line">{text}</p>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
