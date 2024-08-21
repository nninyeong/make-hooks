import MyReact, { useState, useEffect } from "./MyReact.js";

function ExampleComponent() {
  const [count, setCount] = useState(0);
  const [text, setText] = useState("foo");

  useEffect(() => {
    // callback
    console.log("effect", count, text);
    return (
      // callback의 cleanUp
      () => {
        console.log("cleanup", count, text);
      }
    );
  }, [count, text]);

  return {
    // 함수형 컴포넌트가 반환하는 객체
    click: () => setCount(count + 1),
    type: (text) => setText(text),
    noop: () => setCount(count),
    render: () => console.log("render", { count, text }),
  };
}

// 초기 렌더링
let App = MyReact.render(ExampleComponent);

App.click();
App = MyReact.render(ExampleComponent);

App.type("bar");
App = MyReact.render(ExampleComponent);

App.noop();
App = MyReact.render(ExampleComponent);

App.click();
App = MyReact.render(ExampleComponent);
