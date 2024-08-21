let hooks = []; // hook을 사용할 때 필요한 여러 값들을 저장해둘 배열
let currentHook = 0; // 현재 실행되고있는 hook의 순서, 이 값을 인덱스로 활용해 위 배열에서 값을 가져오거나 관리한다

const useState = (initialValue) => {
  // hooks에 값이 있을 때는 그 값을, 없는 경우 initialValue를 hooks[currentHook]에 저장
  // 컴포넌트에서 useState를 이용해 처음 state를 선언했을 때가 아직 hooks[currentHook]에 저장된 값이 없을 때!
  hooks[currentHook] = hooks[currentHook] || initialValue;

  // 나중에 setState가 사용될 때를 위해 선언된 순서를 저장해둠
  // 위에서 currentHook을 사용하는 건 const [~,~] = useState(0); 했을 때는 순서대로 실행되니까 currentHook 바로 사용하면 되고
  // setState는 순서와 상관없이 컴포넌트 내부에서 언제 호출될지 모르니까 선언된 순서인 currentHook을 저장해두고 hookIndex를 사용??
  // 클로저가 있어서 setState가 선언될 때 hookIndex를 기억해둘 수 있다
  const hookIndex = currentHook;
  const setState = (newState) => {
    if (typeof newState === "function") {
      // 함수형변환 한 경우 전달받은 newState는 함수일 것이므로 그 함수를 활용해 새로운 값 할당
      hooks[hookIndex] = newState(hooks[hookIndex]);
    } else {
      hooks[hookIndex] = newState;
    }
  };

  // 나중에 선언해둔 state, setState에 접근할 수 있도록 반환
  // 다음에 호출할 hook의 호출 순서를 관리하기 위해 currentHook을 1증가
  return [hooks[currentHook++], setState];
};

const useEffect = (callback, depArray) => {
  // 의존성배열이 있는지 확인
  const hasNoDeps = !depArray;

  // 이전 Effect가 실행됐을 때의 의존성 배열/cleanUp 을 확인, 첫 실행이라면 undefined
  const prevDeps = hooks[currentHook] ? hooks[currentHook].deps : undefined;
  const prevCleanUp = hooks[currentHook]
    ? hooks[currentHook].cleanUp
    : undefined;

  // 의존성배열에 변화가 있는지 확인
  // 전달받은 depArray를 순회하며 이전 실행 시점의 deps와 비교해 모두 같은 값을 가지고있는지 확인
  // every()로 모든 요소가 같은지 확인, 하나라도 다르면 !false === true
  // 값 자체로 비교하기 때문에 비교할 요소가 참조타입인 경우 [...state]와 같이 새로운 주소에 할당해줘야 하는 것!
  const hasChangedDeps = prevDeps
    ? !depArray.every((el, i) => el === prevDeps[i])
    : true;

  if (hasNoDeps || hasChangedDeps) {
    if (prevCleanUp) prevCleanUp(); // cleanUp이 있는 경우 이전 이펙트의 cleanUp을 먼저 실행

    // 전달받은 callback, depArray를 업데이트 해줌
    const cleanUp = callback();
    hooks[currentHook] = { deps: depArray, cleanUp };
  }

  currentHook++;
};

const MyReact = {
  render(Component) {
    const Comp = Component();
    Comp.render(); // 컴포넌트의 렌더링 함수 실행
    currentHook = 0; // 컴포넌트가 렌더링되면 hook들을 처음부터 다시 실행하므로, 인덱스를 0으로 되돌려둠
    return Comp; // 컴포넌트의 렌더링 함수를 실행하고, 컴포넌트를 반환
  },
};

MyReact.useState = useState;
MyReact.useEffect = useEffect;

export { useState, useEffect };
export default MyReact;
