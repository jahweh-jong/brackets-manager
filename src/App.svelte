<script>
// @ts-nocheck
 

import { onMount } from "svelte";
import CreateBracket from "./lib/CreateBracket.svelte";  
import {  helpers } from 'brackets-manager';
import { BracketsManager } from 'brackets-manager';
import { InMemoryDatabase } from 'brackets-memory-db'; 

let brackets = {}
let createModalState = false
let updateMatchModalState = false
let selected_bracket_id = null
let selected_bracket = null
let selected_match = null

let opp1 = null
let opp2 = null
onMount(() => {
  loadBrackets()
})

const loadBrackets = () => {
  const viewer = document.querySelector('.brackets-viewer')
  viewer.innerHTML = ''
  brackets = JSON.parse(localStorage.getItem('brackets')) || {}; 
}

const deleteBracket = (ss) => {
  try { 
    brackets = JSON.parse(localStorage.getItem('brackets')) || {};
    delete brackets[ss]
    localStorage.setItem('brackets', JSON.stringify(brackets));
    loadBrackets()
    selected_bracket = null
  } catch (err) { 
    console.error(err)
  }
}

const matchClicked = async (match) => { 
  selected_match = match
  const storage = new InMemoryDatabase() 
  const manager = new BracketsManager(storage)  
  manager.import(selected_bracket)
  const stageData = await manager.get.tournamentData(0)  
  
  opp1 = match.opponent1.id ? await helpers.findParticipant(stageData.participant, match.opponent1) : {id: 0, name: 'TBD'} 
  opp2 = match.opponent2.id ? await helpers.findParticipant(stageData.participant, match.opponent2) : {id: 0, name: 'TBD'} 
   
  updateMatchModalState = true
}

const updateMatch = async (e) => {
  const formData = new FormData(e.target); 
  const formObj = Object.fromEntries(formData); 
  const storage = new InMemoryDatabase() 
  const manager = new BracketsManager(storage)  
  await manager.import(selected_bracket);
  let matchUpdate = {
      id: selected_match.id, 
      opponent1: { score: formObj?.opp1_score ?? 0 },
      opponent2: { score: formObj?.opp2_score ?? 0 },
  }

  if (formObj?.winner == 'opp1') {
    matchUpdate.opponent1.result = 'win'; 

	} else if (formObj?.winner == 'opp2') { 
    matchUpdate.opponent2.result = 'win';
  } 
 
  await manager.update.match(matchUpdate); 
  const newData = await manager.export();
  try { 
    let brackets = JSON.parse(localStorage.getItem('brackets')) || {};
    brackets[selected_bracket_id] = newData
    localStorage.setItem('brackets', JSON.stringify(brackets));
    loadBrackets()
    selected_bracket = newData
    renderBracket(selected_bracket)

    updateMatchModalState = false
    e.target.reset()
  } catch (err) { 
    console.error(err)
  }
}
const renderBracket = async (data) => {
  // @ts-ignore   
  window.bracketsViewer.setParticipantImages(data.participant.map(participant => ({
                participantId: participant.id,
                imageUrl: participant?.logo ?? "./default_logo.jpg"
            })));
            // @ts-ignore
            window.bracketsViewer.render({
                stages: data.stage,
                matches: data.match,
                matchGames: data.match_game,
                participants: data.participant,
            }, { 
                onMatchClick: matchClicked,
                clear: true, 
                separatedChildCountLabel: true,
                showSlotsOrigin: true,
                showLowerBracketSlotsOrigin: true,
                highlightParticipantOnHover: true,
            });
}
</script> 
 

<div class="drawer lg:drawer-open">
  <input id="my-drawer-3" type="checkbox" class="drawer-toggle" /> 
  <div class="drawer-content flex flex-col"> 
    <div class="w-full navbar bg-base-300">
      <div class="flex-none lg:hidden">
        <label for="my-drawer-3" aria-label="open sidebar" class="btn btn-square btn-ghost">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="inline-block w-6 h-6 stroke-current"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
        </label>
      </div> 
      <div class="flex-1 py-4 mx-2 font-extrabold text-2xl">Brackets Manager</div> 
    </div> 
    {#if selected_bracket_id && selected_bracket }    
    <div class="flex justify-end">
      <div class="dropdown dropdown-end">
        <div tabindex="0" role="button" class="btn btn-sm m-1">
          <svg class="inline-block w-4 h-4 stroke-current" fill="#000000" viewBox="0 0 32 32" version="1.1" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M12.15 28.012v-0.85c0.019-0.069 0.050-0.131 0.063-0.2 0.275-1.788 1.762-3.2 3.506-3.319 1.95-0.137 3.6 0.975 4.137 2.787 0.069 0.238 0.119 0.488 0.181 0.731v0.85c-0.019 0.056-0.050 0.106-0.056 0.169-0.269 1.65-1.456 2.906-3.081 3.262-0.125 0.025-0.25 0.063-0.375 0.094h-0.85c-0.056-0.019-0.113-0.050-0.169-0.056-1.625-0.262-2.862-1.419-3.237-3.025-0.037-0.156-0.081-0.3-0.119-0.444zM20.038 3.988l-0 0.85c-0.019 0.069-0.050 0.131-0.056 0.2-0.281 1.8-1.775 3.206-3.538 3.319-1.944 0.125-3.588-1-4.119-2.819-0.069-0.231-0.119-0.469-0.175-0.7v-0.85c0.019-0.056 0.050-0.106 0.063-0.162 0.3-1.625 1.244-2.688 2.819-3.194 0.206-0.069 0.425-0.106 0.637-0.162h0.85c0.056 0.019 0.113 0.050 0.169 0.056 1.631 0.269 2.863 1.419 3.238 3.025 0.038 0.15 0.075 0.294 0.113 0.437zM20.037 15.575v0.85c-0.019 0.069-0.050 0.131-0.063 0.2-0.281 1.794-1.831 3.238-3.581 3.313-1.969 0.087-3.637-1.1-4.106-2.931-0.050-0.194-0.094-0.387-0.137-0.581v-0.85c0.019-0.069 0.050-0.131 0.063-0.2 0.275-1.794 1.831-3.238 3.581-3.319 1.969-0.094 3.637 1.1 4.106 2.931 0.050 0.2 0.094 0.394 0.137 0.588z"></path> </g></svg>
        </div>
        <!-- svelte-ignore a11y-no-noninteractive-tabindex -->
        <ul tabindex="0" class="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
          <li><button on:click={()=>deleteBracket(selected_bracket_id)}>Delete</button></li>
        </ul>
      </div>
    </div>
    {/if}

    <div class="brackets-viewer mb-10"></div> 
  </div> 
  <div class="drawer-side">
    <label for="my-drawer-3" aria-label="close sidebar" class="drawer-overlay"></label> 
    <ul class="menu p-4 w-80 min-h-full bg-base-200">  
 
      <li> 
        <button class="mb-4 text-center btn btn-primary" on:click={() => createModalState = true}>
          <span class="font-extrabold">Create</span>
        </button>
      </li> 
      <hr class="my-2 border-t border-base-300" />
      {#each Object.keys(brackets) as bracket (bracket)}
      <li class="flex justify-between">
        <button on:click={() =>{selected_bracket=brackets[bracket]; selected_bracket_id = bracket; renderBracket(brackets[bracket])}}>
          {brackets[bracket]?.stage[0]?.name} 
        </button> 
      </li>
    {/each} 
    </ul>
  </div>
</div>

<dialog class:modal-open={createModalState} class="modal-open modal modal-bottom sm:modal-middle">
  <div class="modal-box"> 
    <button on:click={() => createModalState = false} class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button> 
    <CreateBracket on:success={()=>{loadBrackets(), createModalState=false}}/> 
  </div>
</dialog>



<dialog class:modal-open={updateMatchModalState} class="modal-open modal modal-bottom sm:modal-middle">
  <div class="modal-box"> 
    <button on:click={() => updateMatchModalState = false} class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button> 
     <form on:submit|preventDefault={updateMatch}> 
        <label class="form-control w-full max-w-lg">
          <div class="label">
              <span class="label-text font-bold">{opp1?.name}</span> 
          </div> 
          <div class="join">  
            <input value={selected_match?.opponent1?.score ?? 0} name="opp1_score" type="number" placeholder="score" class="join-item input input-md input-bordered w-full max-w-lg" />  
            <input checked={selected_match?.opponent1?.result === "win"} type="radio" value="opp1" name="winner" class="join-item btn" aria-label="Winner" />  
          </div>
        </label> 

        <label class="form-control w-full max-w-lg">
          <div class="label">
              <span class="label-text font-bold">{opp2?.name}</span> 
          </div> 
          <div class="join">  
            <input value={selected_match?.opponent2?.score ?? 0} name="opp2_score" type="number" placeholder="score" class="join-item input input-md input-bordered w-full max-w-lg" />  
            <input checked={selected_match?.opponent2?.result === "win"} type="radio" value="opp2" name="winner" class=" join-item btn" aria-label="Winner" />  
          </div>
        </label>  
        <button disabled={selected_match?.status === 5 || selected_match?.status === 1 || selected_match?.status === 0} type="submit" class="btn mt-4 w-full">Update</button> 
     </form>
  </div>
</dialog>

<style>
  .brackets-viewer { 
/* Sizes */
--text-size: 14px;
--round-margin: 50px;
--match-width: 200px;
--match-horizontal-padding: 10px;
--match-vertical-padding: 10px;
--connector-border-width: 3px;
--match-border-width: 1px;
--match-border-radius: 0.5em;
}
</style>

 