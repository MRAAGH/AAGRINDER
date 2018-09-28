
async function login(){
  let nameChosen = false;
  let loginName;
  while(!nameChosen){
    loginName = await cli.prompt('login: ');
    if(loginName === '/r' || loginName === '/register'){
      const registerName = await cli.prompt('new name: ');
      const registerPassword = await cli.promptPassword('choose password: ');
      const registerPassword2 = await cli.promptPassword('repeat password: ');
      if(registerPassword !== registerPassword2){
        bigterminal.println('passwords do not match.');
      }
      const rawColor = await cli.prompt('what is your favorite color? ');
      const registerColor = parseColor(rawColor);
      const rawOk = await cli.prompt('recognized as '+registerColor+'. Is this okay? (yes) ');
      const registerOk = rawOk === '' || rawOk[0] === 'y' || rawOk[0] == 'Y';
      if(registerOk){

      }
      else{
        bigterminal.println()
      }

    }
    else{
      nameChosen = true;
    }
  }
  const loginPassword = await cli.promptPassword('password for '+loginName+': ');




}
async function register(){
  const registerName = await cli.prompt('new name: ');
  const registerPassword = await cli.promptPassword('choose password: ');
  const registerPassword2 = await cli.promptPassword('repeat password: ');
  if(registerPassword !== registerPassword2){
    bigterminal.println('passwords do not match.');
    return;
  }
  const rawColor = await cli.prompt('what is your favorite color? ');
  const registerColor = parseColor(rawColor);
  const rawOk = await cli.prompt('recognized as '+registerColor+'. Is this okay? (yes) ');
  const registerOk = rawOk === '' || rawOk[0] === 'y' || rawOk[0] == 'Y';
  if(!registerOk){
    bigterminal.println('cancelled.');
    return;
  }

}

async function verifyUsername(){

}
