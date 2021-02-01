const joinLink = document.getElementById("joinLink");
const joinCall = document.getElementById("joinCall");

        
       
    //join button fade when no link entered 
        joinCall.addEventListener("focus", () => {
            joinLink.classList.remove("hide");
            
        })

        
        joinCall.addEventListener("keyup", () => 
        {
            const joinCallValue = joinCall.value;
            

            if(joinCallValue === "")
            {
                console.log("Null")
                joinLink.classList.add("fadelink");
            }
            else
            {
                console.log(joinCallValue)
                joinLink.classList.remove("fadelink");
            }
        })
        

        //redirect user to the room
        joinLink.addEventListener('click', () => {
        
            window.location.href = `${joinCall.value}`
        })



