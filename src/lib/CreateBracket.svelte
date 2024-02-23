<script>
// @ts-nocheck
 
    import { SortableList } from '@jhubbardsf/svelte-sortablejs' 
    import { createEventDispatcher } from 'svelte';
    import { BracketsManager } from 'brackets-manager';
    import { InMemoryDatabase } from 'brackets-memory-db'; 
    let dispatch = createEventDispatcher();
 
    let participantsFormError = {}
    let bracketsFormsError = {}
    let participants = []
     
    const removeParticipant = (id) => {
        try {
            participants = participants.filter(participant => participant.id !== id);
            if (participants.length < 2 || !isPowerOfTwo(participants)) { 
                bracketsFormsError['isPowerOfTwo'] = "The number of participants should be at least 2 and a power of 2 (e.g., 2, 4, 8, 16)."
            } else { 
                if (bracketsFormsError?.isPowerOfTwo) {
                    delete bracketsFormsError.isPowerOfTwo
                }  
            }
        } catch (err) {
            console.error("Error removing participant:", err);
        }
    };


    const addParticipant = (e) => {
        try {
            const formData = new FormData(e.target); 
            let name = formData.get('name').toString().trim(); 
            const logo = formData.get('logo'); 
            
            participantsFormError = {}
            if (name.length <= 2){
                participantsFormError['name'] = 'Name should be greater than 2 characters.'
                return
            }

            if (participants.some(participant => participant.name.toLowerCase() === name.toLowerCase())){
                participantsFormError['name'] = 'Participant already exist.'
                return
            }

            const newParticipant = {
                id: getRandomInt(1, 20000), 
                name: name, 
                logo: createLogoURL(logo)
            }
            participants = [...participants, newParticipant]
            e.target.reset() 
            
            const logoPreview = document.getElementById('logo_preview');
            if (logoPreview) {
                // @ts-ignore
                logoPreview.src = './default_logo.jpg';
            }

            if (participants.length < 2 || !isPowerOfTwo(participants)) { 
                bracketsFormsError['isPowerOfTwo'] = "The number of participants should be at least 2 and a power of 2 (e.g., 2, 4, 8, 16)."
            } else { 
                if (bracketsFormsError?.isPowerOfTwo) {
                    delete bracketsFormsError.isPowerOfTwo
                }  
            }
        } catch (err) {
            console.error("Error adding participant:", err)
        } 
    }
    
    const getRandomInt = (min, max) => {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }


    const createLogoURL = (logo) => {
        try {
            if (logo && logo.size !== 0) {
                const source = URL.createObjectURL(logo);
                return source;
            }
        } catch (err) {
            console.error('Error creating logo URL:', err);
        } 

        return null;
    };

    const isPowerOfTwo = (arr) => {
        const length = arr.length;
        // Check if the length is a positive integer
        if (length <= 0 || !Number.isInteger(length)) {
            return false;
        }
        // Check if the length is a power of 2
        return (length & (length - 1)) === 0;
    }
    
    const showPreview = (e) => {
        try {      
            const target = e.target
            const files = target.files
    
            if (files.length > 0) {
                const source = URL.createObjectURL(files[0])
                // @ts-ignore
                document.getElementById("logo_preview").src = source
            }
        } catch (err) {
            console.error('Error showing a preview of the selected logo: ', err)
        }
    }

    const reSortList = (e) => {
        try {
            const participantElement = e.item;
            const participantID = parseInt(participantElement.querySelector('#participant_id').value, 10);
            const oldIdx = e.oldIndex;
            const newIdx = e.newIndex;

            // Find the participant with the given ID
            const participantToMove = participants.find(participant => participant.id === participantID);

            // Ensure the participant is found
            if (participantToMove) {
                // Remove the participant from the original position
                participants.splice(oldIdx, 1);
                
                // Insert the participant at the new position
                participants.splice(newIdx, 0, participantToMove);
            } else {
                console.error(`Participant with ID ${participantID} not found.`);
            }

             
        } catch (err) {
            console.error("Error resorting participant list:", err);
        }
    };


    let bracket_name = '' 
    let stage_type = '--'

    // se
    // comment for now, just default to natural
    // let se_seeding_order = '--' 
    let se_settings = { 
      consolationFinal: false,
      seedOrdering: ['natural']
    } 
    // de
    // comment for now, just default to natural
    // let de_seeding_order = [] 
    let de_settings = { 
      skipFirstRound: false,
      grandFinal: '--',
      consolationFinal: false,
      seedOrdering: ['natural'],
    } 

    // rr 
    let rr_settings = {
      roundRobinMode: '--',
      groupCount: null,
      seedOrdering: []
    }
    const createBracket = async (e) => {
        bracketsFormsError = {}

        if (bracket_name.length <= 2){
            bracketsFormsError['bracketName'] = "Bracket name should be greater than 2 characters."
        }
 

        if (participants.length < 2 || !isPowerOfTwo(participants)) {
            bracketsFormsError['isPowerOfTwo'] = "The number of participants should be at least 2 and a power of 2 (e.g., 2, 4, 8, 16)."
        }

        if (stage_type === '--') {
            bracketsFormsError['stageType'] = "Please select a stage type."
        }

        if (stage_type === 'de' && de_settings['grandFinal'] === '--') {
            bracketsFormsError['de_GrandFinalsType'] = "Please select a grand finals type."
        }

        if (stage_type === 'rr' && rr_settings['roundRobinMode'] === '--') {
            bracketsFormsError['rr_roundRobinMode'] = "Please select a mode for round robin."
        }

        if (stage_type === 'rr' && rr_settings['seedOrdering'].length <= 0) {
            bracketsFormsError['rr_seedOrdering'] = "Please select seed ordering type."
        }

        if (stage_type === 'rr' && (rr_settings['groupCount'] === null || rr_settings['groupCount'] <= 0)) {
            bracketsFormsError['rr_groupCount'] = "Please enter a number of group(s) for round robin."
        } 

        if (Object.keys(bracketsFormsError).length > 0) {
           return
        }
        
        let config = {
            tournamentId: 0, 
            name: bracket_name,
            seeding: participants,
            type: stage_type
        }; 

        if (stage_type === 'se') {
            config['type'] = 'single_elimination'
            config['settings'] = se_settings
        }
        else if (stage_type === 'de') {
            config['type'] = 'double_elimination'
            config['settings'] = de_settings
        }
        else if (stage_type === 'rr') {
            config['type'] = 'round_robin'
            rr_settings['seedOrdering'] = Array.isArray(rr_settings['seedOrdering']) ? rr_settings['seedOrdering'] : [rr_settings['seedOrdering']]
            config['settings'] = rr_settings
        }
 
        const successInsert = await insertIntoLocalStorage(config)
        if (successInsert) {  
            dispatch('success', { detail: 'Bracket successFully created.' });
            e.target.reset()
            createFields()

        } else {
            console.log('Error while inserting to localStorage')
        }   
    }

    const createFields = () => {
        bracket_name = '' 
        stage_type = '--'

        participants = []  
        se_settings = { 
            consolationFinal: false,
            seedOrdering: ['natural']
        }  
        de_settings = { 
            skipFirstRound: false,
            grandFinal: '--',
            consolationFinal: false,
            seedOrdering: ['natural'],
        }  
        rr_settings = {
            roundRobinMode: '--',
            groupCount: null,
            seedOrdering: []
        }
    }

    const insertIntoLocalStorage = async (config) => {

        try {
            const BRACKETS = 'brackets' 
            const storage = new InMemoryDatabase()    
			const manager = new BracketsManager(storage)  
			await manager.create.stage(config)

            const rawStoredBrackets = localStorage.getItem(BRACKETS);

            if (null === rawStoredBrackets || '' === rawStoredBrackets) { 
                localStorage.setItem(BRACKETS, JSON.stringify({ 
                    0: storage.data,
                }));  
            } else {
                let storedBrackets = JSON.parse(rawStoredBrackets);   
                let index = Object.keys(storedBrackets).length; 
               
                storedBrackets[index] = storage.data; 
                localStorage.setItem(BRACKETS, JSON.stringify(storedBrackets)); 
            } 
        } catch (error) {
            console.log(error)
            return false
        }
        return true 
    }
</script>

<h5 class="text-lg font-semibold text-center mt-4">New Bracket</h5>
<div class="modal-action flex justify-center mx-4 mb-4">  
    <form on:submit={createBracket} class="max-w-lg w-full" method="dialog" action="">

        <label class="form-control w-full max-w-lg">
            <div class="label">
                <span class="label-text">Bracket name</span> 
            </div>
            <input bind:value={bracket_name} type="text" placeholder="Type here" class="input input-md input-bordered w-full max-w-lg" /> 
            <div class="label">
                <span class="label-text-alt text-red-400">{bracketsFormsError?.bracketName ?? ''}</span> 
            </div> 
        </label> 
 
        <div class="label">
            <span class="label-text">Participants</span>  
        </div>
        
        <div class="border border-gray-300 rounded-sm p-4 space-y-4"> 

            <SortableList onEnd={reSortList} class="space-y-4" animation={250}>

                {#each participants as participant (participant.id) }
                    <div class="flex items-center justify-between  hover:cursor-grab">
                        <input hidden id="participant_id" value={participant.id}>
                        <div class="avatar">
                            <div class="mask mask-squircle w-12 h-12">
                                <img src={participant.logo ?? "./default_logo.jpg"} alt="Avatar Tailwind CSS Component" />
                            </div>
                        </div> 
                        <div class="label">
                            <span class="label-text font-bold">{participant.name}</span>
                        </div> 
                        <button type="button" on:click={()=>removeParticipant(participant.id)} class="btn btn-ghost btn-xs"> 
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" fill="currentColor" class="w-4 h-4 m-1 opacity-70"><path d="M135.2 17.7L128 32H32C14.3 32 0 46.3 0 64S14.3 96 32 96H416c17.7 0 32-14.3 32-32s-14.3-32-32-32H320l-7.2-14.3C307.4 6.8 296.3 0 284.2 0H163.8c-12.1 0-23.2 6.8-28.6 17.7zM416 128H32L53.2 467c1.6 25.3 22.6 45 47.9 45H346.9c25.3 0 46.3-19.7 47.9-45L416 128z"/></svg>
                        </button>
                    </div> 
                {/each}
                
            </SortableList>
           
            
            <form on:submit|preventDefault={addParticipant} class="flex gap-2 items-center justify-between"  action=""> 
                <label for="logo" class="hover: cursor-pointer">
                    <div class="avatar">
                        <div class="mask mask-squircle w-12 h-12">
                            <img id="logo_preview" src="./default_logo.jpg" alt="Default logo" />
                        </div>
                    </div> 
                    <input on:change={showPreview} hidden type="file" name="logo" id="logo">
                </label>
                <label class="form-control w-full max-w-xs">
                    <input class="border border-gray-300 input input-secondary w-full max-w-xs font-bold" type="text" name="name"> 
                </label> 
                <button type='submit' class="btn btn-ghost btn-xs">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" fill="currentColor" class="w-4 h-4 m-1 opacity-70"><path d="M256 80c0-17.7-14.3-32-32-32s-32 14.3-32 32V224H48c-17.7 0-32 14.3-32 32s14.3 32 32 32H192V432c0 17.7 14.3 32 32 32s32-14.3 32-32V288H400c17.7 0 32-14.3 32-32s-14.3-32-32-32H256V80z"/></svg>
                </button> 
            </form> 
            <div class="text-center text-xs text-red-400">
                {participantsFormError?.name ?? ''}
            </div>  
        </div> 
        {#if bracketsFormsError?.isPowerOfTwo}
            <small class="text-red-400">{bracketsFormsError?.isPowerOfTwo}</small>
        {/if}
        <label class="form-control w-full max-w-lg">
            <div class="label">
                <span class="label-text">Stage type</span> 
            </div>
            <select  bind:value={stage_type} class="select select-bordered w-full max-w-lg">
                <option disabled selected>--</option>
                <option value="se" >Single Elimination</option>
                <option value="de" >Double Elimination</option>
                <option value="rr" >Round Robin</option>
            </select>
            <div class="label">
                <span class="label-text-alt text-red-400">{bracketsFormsError?.stageType ?? ''}</span> 
            </div> 
        </label>

        {#if stage_type === 'se'} 
        <!-- <label class="form-control w-full max-w-lg">
            <div class="label">
                <span class="label-text">Seed order</span> 
            </div>
            <select bind:value={se_seeding_order} class="select select-bordered w-full max-w-lg">
                <option disabled selected>--</option>
                <option value="natural" >Natural</option>
                <option value="reverse" >Reverse</option>
                <option value="half_shift" >Half Shift</option>
                <option value="reverse_half_shift" >Reverse Half Shift</option>
                <option value="pair_flip" >Pair Flip</option>
                <option value="inner_outer" >Inner Outer</option> 
              </select>
        </label> -->

        <div class="mt-4 form-control">
            <label class="label cursor-pointer">
              <span class="label-text">Consolation Final</span> 
              <input bind:checked={se_settings['consolationFinal']} type="checkbox" class="checkbox" />
            </label>
          </div>
        {/if}

        
        {#if stage_type === 'de'} 
        <!-- <label class="form-control w-full max-w-lg">
            <div class="label">
                <span class="label-text">Seed order</span> 
            </div>
            <select bind:value={de_seeding_order} class="select select-bordered w-full max-w-lg h-72" multiple> 
                <option value="natural" >Natural</option>
                <option value="reverse" >Reverse</option>
                <option value="half_shift" >Half Shift</option>
                <option value="reverse_half_shift" >Reverse Half Shift</option>
                <option value="pair_flip" >Pair Flip</option>
                <option value="inner_outer" >Inner Outer</option> 
              </select>
        </label> -->

        <label class="form-control w-full max-w-lg">
            <div class="label">
                <span class="label-text">Grand finals type</span> 
            </div>
            <select  bind:value={de_settings['grandFinal']} class="select select-bordered w-full max-w-lg">
                <option disabled selected>--</option>
                <option value="simple" >Simple</option>
                <option value="double" >Double</option> 
            </select>
            <div class="label">
                <span class="label-text-alt text-red-400">{bracketsFormsError?.de_GrandFinalsType ?? ''}</span> 
            </div> 
        </label>

        <div class="mt-4 form-control">
            <label class="label cursor-pointer">
              <span class="label-text">Consolation Final</span> 
              <input bind:checked={de_settings['consolationFinal']} type="checkbox" class="checkbox" />
            </label>
        </div>

        <div class="mt-4 form-control">
            <label class="label cursor-pointer">
              <span class="label-text">Skip first round</span> 
              <input bind:checked={de_settings['skipFirstRound']} type="checkbox" class="checkbox" />
            </label>
        </div>
        {/if}

                
        {#if stage_type === 'rr'} 

        <label class="form-control w-full max-w-lg">
            <div class="label">
                <span class="label-text">Group count</span> 
            </div>
            <input bind:value={rr_settings['groupCount']} type="number" placeholder="Type here" class="input input-md input-bordered w-full max-w-lg" /> 
            <div class="label">
                <span class="label-text-alt text-red-400">{bracketsFormsError?.rr_groupCount ?? ''}</span> 
            </div> 
        </label>

        <label class="form-control w-full max-w-lg">
            <div class="label">
                <span class="label-text">Seeding order</span> 
            </div>
            <select  bind:value={rr_settings['seedOrdering']} class="select select-bordered w-full max-w-lg">
                <option disabled selected>--</option>
                <option value="groups.effort_balanced">Effort Balanced</option>
                <option value="groups.seed_optimized">Seed Optimized</option> 
                <option value="groups.bracket_optimized">Bracket Optimized</option> 
            </select>
            <div class="label">
                <span class="label-text-alt text-red-400">{bracketsFormsError?.rr_seedOrdering ?? ''}</span> 
            </div> 
        </label>

        <label class="form-control w-full max-w-lg">
            <div class="label">
                <span class="label-text">Type</span> 
            </div>
            <select  bind:value={rr_settings['roundRobinMode']} class="select select-bordered w-full max-w-lg">
                <option disabled selected>--</option>
                <option value="simple">Simple</option>
                <option value="double">Double</option>  
            </select>
            <div class="label">
                <span class="label-text-alt text-red-400">{bracketsFormsError?.rr_roundRobinMode ?? ''}</span> 
            </div> 
        </label>
        {/if} 
        <button type="submit" class="btn mt-4 w-full">Create</button>
    </form>
</div>
    