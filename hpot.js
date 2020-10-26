//Requirements Importer
const ReadLine = require("readline").createInterface({
    input: process.stdin,
    output: process.stdout
})
const HoneyPot = require("honeypot")
const JSONFile = require("jsonfile")
const Chalk = require("chalk")

//Variables
const Settings = require("./security/settings.json")
const HoneyPotH = new HoneyPot(Settings.httpBL)
const Args = process.argv.slice(2)

//Main
async function Main(){
    ReadLine.resume()
    JSONFile.readFile("./security/settings.json", function(err, data){
        if(err){
            console.log(Chalk.red(`[HPot] Error occurred: ${err}`))
            return
        }
        try{
            if(data.httpBL == null || data.httpBL == ""){
                ReadLine.question(Chalk.cyanBright("httpBL API: "), api =>{
                    if(api == null || api.length <= 1){
                        console.log(Chalk.red("[HPot] Invalid honeypot api."))
                        Main()
                    }else{
                        data.httpBL = api
                        console.log(Chalk.greenBright("[HPot] Success: configuring httpBL API."))
                        JSONFile.writeFile("./security/settings.json", data, function(err2){
                            if(err2){
                                console.log(Chalk.red(`[HPot] Error occurred: ${err2}`))
                                process.exit(1)
                                return
                            }
                            console.log(Chalk.greenBright("[HPot] Success: httpBL API successfully configured. Please run hpot.js again."))
                            process.exit()
                            return
                        })
                    }
                })
            }else{
                CLI()
                function CLI(){
                    ReadLine.resume()
                    ReadLine.question(Chalk.blueBright("HPot") + Chalk.magentaBright("> "), ip => {
                        try{
                            if(ip == null || ip.length <= 1){
                                console.log(Chalk.red("[HPot] Invalid ip."))
                                CLI()
                                return
                            }else{
                                HoneyPotH.query(ip, function(err3, res){
                                    if(!res){
                                        console.log(Chalk.greenBright(`[HPot] Success: IP ${ip} is not a spammer or a bot.`))
                                        CLI()
                                        return
                                    }else{
                                        console.log(Chalk.greenBright(`[HPot] Success: IP ${ip} is a spammer or a bot.`))
                                        CLI()
                                        return
                                    }
                                })
                            }
                        }catch{
                            console.log(Chalk.red("[HPot] Invalid ip."))
                            CLI()
                            return
                        }
                    })
                }
            }
        }catch{
            console.log(Chalk.red("[HPot] Error occurred: settings.json corrupted or empty."))
            return
        }
    })
}
if(Args[0] == "reset"){
    console.log(Chalk.yellowBright("[HPot] Warning: resetting settings.json"))
    JSONFile.writeFile("./security/settings.json", { "httpBL": "" }, function(err){
        if(err){
            console.log(Chalk.red(`[HPot] Error occurred: ${err}`))
            process.exit(1)
            return
        }
        console.log(Chalk.greenBright("[HPot] Success: settings.json successfully resetted."))
        process.exit()
        return
    })
}else{
    Main()
}