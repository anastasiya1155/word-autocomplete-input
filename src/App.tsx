import React from "react";
import throttle from "lodash.throttle";
import getCaretCoordinates from "textarea-caret";
import { useCombobox } from "downshift";

const OPTION_LIST_MIN_WIDTH = 100;

function sleep(delay = 0) {
  return new Promise((resolve) => {
    setTimeout(resolve, delay);
  });
}

const throttledRequest = throttle(
  async (lastWord, setOptions): Promise<void> => {
    await sleep(500);
    setOptions([`lang:${lastWord}`, `repo:${lastWord}`, `file:${lastWord}`]);
  },
  300,
  { trailing: true, leading: false },
);

function App() {
  const [options, setOptions] = React.useState<string[]>([]);
  const [inputValue, setInputValue] = React.useState("");
  const [left, setLeft] = React.useState(0);
  const [top, setTop] = React.useState(0);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const {
    isOpen,
    getLabelProps,
    getMenuProps,
    getInputProps,
    getComboboxProps,
    getItemProps,
  } = useCombobox({
    inputValue,
    onStateChange: async (state) => {
      if (state.type === "__item_click__") {
        const words = inputValue.split(" ");
        words[words.length - 1] = state.selectedItem || words[words.length - 1];
        const newInputValue = words.join(" ");
        setInputValue(newInputValue);
      } else if (state.type === "__input_change__") {
        if (!state.inputValue) {
          return;
        }
        setInputValue(state.inputValue);
        const words = state.inputValue.split(" ");
        const lastWord = words[words.length - 1];
        if (lastWord && !/\s+/.test(lastWord)) {
          await throttledRequest(lastWord, setOptions);
        } else {
          setOptions([]);
        }
        const input = inputRef.current;
        if (input) {
          const caret = state.inputValue.lastIndexOf(" ");
          const caretPos = getCaretCoordinates(input, caret);
          const rect = input.getBoundingClientRect();

          const newTop = caretPos.top + input.offsetTop;
          const newLeft = Math.min(
            caretPos.left + input.offsetLeft,
            input.offsetLeft + rect.width - OPTION_LIST_MIN_WIDTH,
          );
          setTop(newTop);
          setLeft(newLeft);
        }
      }
    },
    items: options,
    itemToString(item) {
      return item || "";
    },
  });

  return (
    <div
      style={{
        position: "relative",
        width: "100vw",
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div>
        <label className="w-fit" {...getLabelProps()}>
          Write smth:
        </label>
        <div {...getComboboxProps()}>
          <input
            placeholder="Best book ever"
            className="w-full p-1.5"
            {...getInputProps({}, { suppressRefError: true })}
            ref={inputRef}
            style={{ width: 500 }}
          />
        </div>
      </div>
      <ul
        {...getMenuProps()}
        style={{
          position: "absolute",
          top,
          left,
          listStyle: "none",
          padding: 0,
        }}
      >
        {isOpen &&
          options.map((item, index) => (
            <li key={`${item}${index}`} {...getItemProps({ item, index })}>
              <span>{item}</span>
            </li>
          ))}
      </ul>
    </div>
  );
}

export default App;
