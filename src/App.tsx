import React from "react";
import {
  Autocomplete,
  createTheme,
  CssBaseline,
  Grid,
  TextField,
  ThemeProvider,
} from "@mui/material";
import throttle from "lodash.throttle";
import getCaretCoordinates from "textarea-caret";

const theme = createTheme();
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

const MyPopper = ({ open, left, top, ...rest }: any) => {
  return (
    <div
      style={{
        top: top + 20,
        left,
        position: "absolute",
        minWidth: 80,
        minHeight: 20,
      }}
    >
      {rest.children}
    </div>
  );
};

function App() {
  const [options, setOptions] = React.useState<string[]>([]);
  const [inputValue, setInputValue] = React.useState("");
  const [value, setValue] = React.useState("");
  const [left, setLeft] = React.useState(0);
  const [top, setTop] = React.useState(0);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleInput = React.useCallback(
    async (event: React.SyntheticEvent, newInputValue: string) => {
      setInputValue(newInputValue);
      const words = newInputValue.split(" ");
      const lastWord = words[words.length - 1];
      if (lastWord && !/\s+/.test(lastWord)) {
        await throttledRequest(lastWord, setOptions);
      } else {
        setOptions([]);
      }
      const input = inputRef.current;
      if (input) {
        const caret = newInputValue.lastIndexOf(" ");
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
    },
    [],
  );

  const handleChange = React.useCallback(
    async (event: React.SyntheticEvent, newValue: string) => {
      const words = inputValue.split(" ");
      words[words.length - 1] = newValue;
      const newInputValue = words.join(" ");
      setInputValue(newInputValue);
      setValue(newInputValue);
    },
    [inputValue],
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Grid
        container
        justifyContent="center"
        alignItems="center"
        sx={{ height: "100vh" }}
      >
        <Grid item sx={{ width: 500, position: "relative" }}>
          <Autocomplete
            freeSolo
            disableClearable
            filterOptions={(x) => x}
            value={value}
            onChange={handleChange}
            inputValue={inputValue}
            onInputChange={handleInput}
            options={options}
            fullWidth
            renderInput={(params) => (
              <TextField
                {...params}
                label="Search input"
                InputProps={{
                  ...params.InputProps,
                  type: "search",
                }}
                inputRef={inputRef}
              />
            )}
            PopperComponent={(props) => (
              <MyPopper {...props} left={left} top={top} />
            )}
          />
          {/*<span*/}
          {/*  style={{*/}
          {/*    left,*/}
          {/*    top,*/}
          {/*    position: "absolute",*/}
          {/*    width: 5,*/}
          {/*    height: 5,*/}
          {/*    backgroundColor: "red",*/}
          {/*  }}*/}
          {/*/>*/}
        </Grid>
      </Grid>
    </ThemeProvider>
  );
}

export default App;
