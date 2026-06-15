<script lang="ts">
  import { Command } from '@tauri-apps/plugin-shell'

  function testLxdTool() {

  }

</script>

<main class="container">
  <!--Want better fonts-->
  <!--Style better, especially buttons-->
  <!--Need to set default text editor/ide-->
  <h1>Greg's Ops Tool</h1>

  <div id='tools-menus'>
    <div id='lxd-tools'>
      <h2>LXD Tools</h2>
      <!--Close any other windows to open this-->
      <button>Open lxd-tools</button>
      <button>Test lxd-tools</button>
      <button>Build lxd-tools locally</button>
      <button>lxd-tools git status</button>
      <button>Open lxd-tools in GitHub</button>
    </div>

    <div id='misc'>
      <h2>Misc</h2>
      <!--Want this to evolve to let the user do text input, browse input or recent dropdown -->
      <input type="text" id="path" placeholder="Repo path"/>
      <button>Open Repo</button>
      <button>Repo git status</button>
    </div>
  </div>


</main>

<style>
  :root {
    background-color:#1d2433;
    color: #d7dce2;
  }

  h1 {
    text-align: center;
    font-family: 'Lucida Sans', 'Lucida Sans Regular', 'Lucida Grande', 'Lucida Sans Unicode', Geneva, Verdana, sans-serif;
  }

  h2 {
    text-align: center;
  }

  button {
    background-color: #6679a4;
    color: #d8dce2;
    border-radius: 5px;
    margin: .1vh 0;
    padding: 2vh 0;
  }

  button:hover {
    background-color: #96a6cc;
  }

  #tools-menus {
    margin: 0% 5%;
    display: flex;
    gap: 2rem;
  }

  #lxd-tools, #misc {
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

</style>
