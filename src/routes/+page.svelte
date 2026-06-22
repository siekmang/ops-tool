<script lang="ts">
  import { openUrl } from "@tauri-apps/plugin-opener";
  import { logToWindow, clearBtn } from "../utils"
</script>

<main class="container">
  <!--Want better fonts-->
  <!--Style better, especially buttons-->
  <!--Need to set default text editor/ide-->
  <h1>Greg's Ops Tool</h1>

  <div id="tools-menus">
    <div id="lxd-tools">
      <h2>LXD Tools</h2>
      <!--Close any other windows to open this-->
      <button>Open lxd-tools</button>
      <button>Test lxd-tools</button>
      <button>Build lxd-tools locally</button>
      <button onclick={() => logToWindow("Hello, World.")}>lxd-tools git status</button>
      <button
        onclick={() =>
          openUrl(
            "https://github.com/Unity-Environmental-University/lxd-tools",
          )}>Open lxd-tools in GitHub</button
      >
    </div>

    <div id="misc">
      <h2>Misc</h2>
      <!--Want this to evolve to let the user do text input, browse input or recent dropdown -->
      <input type="text" id="path" placeholder="Repo path" />
      <button>Open Repo</button>
      <button>Repo git status</button>
      <div id="productivity-menu">
        <button>Dev Folder</button>
        <button>Trello</button>
        <button>Todoist</button>
        <!--Want to add open TEST101, TEST505, reset TEST101/505, and a daily sync button for a script that pulls tasks from Todoist -->
      </div>
    </div>
  </div>

  <div class="console-wrapper">
    <div class="console-header">
      <span>Console</span>
      <button id="clear-btn" onclick={() => clearBtn()}>Clear</button>
    </div>
    <pre id="console-window"></pre>
  </div>
</main>

<style>
  :root {
    background-color: #1d2433;
    color: #d7dce2;
  }

  h1 {
    text-align: center;
    font-family:
      "Lucida Sans", "Lucida Sans Regular", "Lucida Grande",
      "Lucida Sans Unicode", Geneva, Verdana, sans-serif;
  }

  h2 {
    text-align: center;
  }

  button {
    background-color: #6679a4;
    color: #d8dce2;
    border-radius: 5px;
    margin: 0.1vh 0;
    padding: 2vh 0;
  }

  button:hover {
    background-color: #96a6cc;
  }

  #tools-menus {
    margin: 0% 5%;
    padding-bottom:15px;
    display: flex;
    gap: 2rem;
  }

  #lxd-tools,
  #misc {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  input {
    background-color: #d7dce2;
    color: #171c28;
    padding: 5px 0;
    padding-left: 5px;
  }

  ::placeholder {
    color: #a2aabc;
  }

  .console-wrapper {
    background-color: #1e1e1e;
    color: #00ff00; /* Classic hacker green, or #ffffff for clean white */
    font-family: 'Courier New', Courier, monospace;
    border-radius: 6px;
    overflow: hidden;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
    margin: 20px;
  }

  .console-header {
    background-color: #2d2d2d;
    color: #aaaaaa;
    padding: 8px 12px;
    font-size: 14px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #3c3c3c;
  }

  #clear-btn {
    background: #444;
    color: #fff;
    border: none;
    padding: 4px 8px;
    cursor: pointer;
    border-radius: 4px;
  }

  #clear-btn:hover {
    background: #555;
  }

  #console-window {
    height: 230px; /* Adjust height as needed */
    max-height: 300px;
    overflow-y: auto;
    padding: 15px;
    margin: 0;
    white-space: pre-wrap;      /* Wraps long lines */
    word-wrap: break-word;
  }
</style>
