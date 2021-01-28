const joinLink = document.getElementById("joinLink");
const joinCall = document.getElementById("joinCall");

        
       

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
