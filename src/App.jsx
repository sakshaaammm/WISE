import React, { useState, useEffect } from 'react'
import "./App.css"
import Navbar from './components/Navbar'
import Editor from '@monaco-editor/react';
import Select from 'react-select';
import { GoogleGenAI } from "@google/genai";
import Markdown from 'react-markdown'
import RingLoader from "react-spinners/RingLoader";

const App = () => {
  const options = [
    { value: 'javascript', label: 'JavaScript' },
    { value: 'python', label: 'Python' },
    { value: 'java', label: 'Java' },
    { value: 'csharp', label: 'C#' },
    { value: 'cpp', label: 'C++' },
    { value: 'php', label: 'PHP' },
    { value: 'ruby', label: 'Ruby' },
    { value: 'go', label: 'Go' },
    { value: 'swift', label: 'Swift' },
    { value: 'kotlin', label: 'Kotlin' },
    { value: 'typescript', label: 'TypeScript' },
    { value: 'rust', label: 'Rust' },
    { value: 'dart', label: 'Dart' },
    { value: 'scala', label: 'Scala' },
    { value: 'perl', label: 'Perl' },
    { value: 'haskell', label: 'Haskell' },
    { value: 'elixir', label: 'Elixir' },
    { value: 'r', label: 'R' },
    { value: 'matlab', label: 'MATLAB' },
    { value: 'bash', label: 'Bash' }
  ];

  const [selectedOption, setSelectedOption] = useState(options[0]);
  const [theme, setTheme] = useState('dark');

  const customStyles = {
    control: (provided) => ({
      ...provided,
      backgroundColor: '#18181b', // dark background (similar to bg-zinc-900)
      borderColor: '#3f3f46',
      color: '#fff',
      width: "100%"
    }),
    menu: (provided) => ({
      ...provided,
      backgroundColor: '#18181b', // dropdown bg
      color: '#fff',
      width: "100%"
    }),
    singleValue: (provided) => ({
      ...provided,
      color: '#fff',  // selected option text
      width: "100%"
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isFocused ? '#27272a' : '#18181b',  // hover effect
      color: '#fff',
      cursor: 'pointer',
      // width: "30%"
    }),
    input: (provided) => ({
      ...provided,
      color: '#fff',
      width: "100%"
    }),
    placeholder: (provided) => ({
      ...provided,
      color: '#a1a1aa',  // placeholder text color
      width: "100%"
    }),
  };

  const [code, setCode] = useState("");

  const ai = new GoogleGenAI({ apiKey: "AIzaSyDRFK32a0SvQI3VTDrtq3N0LTE759OhWzw" }); // replace "YOUR_API_KEY" with you api key
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState("");

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  async function reviewCode() {
    setResponse("")
    setLoading(true);
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: `You are an expert-level software developer, skilled in writing efficient, clean, and advanced code.
I'm sharing a piece of code written in ${selectedOption.value}.
Your job is to deeply review this code and provide the following:

1️⃣ A quality rating: Better, Good, Normal, or Bad.
2️⃣ Detailed suggestions for improvement, including best practices and advanced alternatives.
3️⃣ A clear explanation of what the code does, step by step.
4️⃣ A list of any potential bugs or logical errors, if found.
5️⃣ Identification of syntax errors or runtime errors, if present.
6️⃣ Solutions and recommendations on how to fix each identified issue.

Analyze it like a senior developer reviewing a pull request.

Code: ${code}
`,
    });
    setResponse(response.text)
    setLoading(false);
  }

  // Fix code function using Gemini AI
  const fixCodeWithAI = async () => {
    if (!code) {
      alert("Please enter code first");
      return;
    }
    setLoading(true);
    setResponse("");
    try {
      const aiResponse = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: `You are an expert developer. Fix all errors and improve the following ${selectedOption.value} code. Return ONLY the corrected code, nothing else.\n\nCode:\n${code}`,
      });
      console.log('Gemini AI response:', aiResponse);
      // Try to get the code from .text or .candidates[0].content.parts[0].text
      let fixedCode = aiResponse.text;
      if (!fixedCode && aiResponse.candidates && aiResponse.candidates[0]?.content?.parts[0]?.text) {
        fixedCode = aiResponse.candidates[0].content.parts[0].text;
      }
      if (!fixedCode) {
        alert("Gemini did not return any fixed code. Please try again or check your API key.");
        setLoading(false);
        return;
      }
      setCode(fixedCode);
    } catch (e) {
      alert("Could not fix code: " + e.message);
    }
    setLoading(false);
  };

  // Ensure body background color matches theme
  useEffect(() => {
    document.body.style.backgroundColor = theme === 'dark' ? '#000' : '#fff';
    document.body.style.color = theme === 'dark' ? '#fff' : '#000';
  }, [theme]);

  return (
    <>
      <Navbar onToggleTheme={toggleTheme} theme={theme} />
      <div
        className="main flex justify-between"
        style={{
          height: "calc(100vh - 90px)",
          backgroundColor: theme === 'dark' ? '#000' : '#fff',
          color: theme === 'dark' ? '#fff' : '#000',
          transition: 'background 0.3s, color 0.3s',
        }}
      >
        <div className="left h-[87.5%] w-[50%]">
          <div className="tabs !mt-5 !px-5 !mb-3 w-full flex items-center gap-[10px]">
            <Select
              value={selectedOption}
              onChange={(e) => { setSelectedOption(e) }}
              options={options}
              styles={customStyles}
            />
            <button
              className="btnNormal bg-zinc-900 min-w-[120px] transition-all hover:bg-zinc-800"
              onClick={fixCodeWithAI}
            >
              Fix Code
            </button>
            <button onClick={() => {
              if (code === "") {
                alert("Please enter code first")
              }
              else {
                reviewCode()
              }
            }} className="btnNormal bg-zinc-900 min-w-[120px] transition-all hover:bg-zinc-800">Review</button>
          </div>

          <Editor height="100%" theme={theme === 'dark' ? 'vs-dark' : 'light'} language={selectedOption.value} value={code} onChange={(e) => { setCode(e) }} />
        </div>

        <div className="right overflow-scroll !p-[10px] bg-zinc-900 w-[50%] h-[101%]">
          <div className="topTab border-b-[1px] border-t-[1px] border-[#27272a] flex items-center justif-between h-[60px]">
            <p className='font-[700] text-[17px]'>Response</p>
          </div>
          {loading && <RingLoader color='#9333ea'/>}
          <Markdown>{response}</Markdown>
        </div>
      </div>
    </>
  )
}

export default App