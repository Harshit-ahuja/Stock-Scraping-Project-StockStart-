#!/usr/bin/env node

require("chromedriver");
const wd = require("selenium-webdriver");
const fs = require("fs");

const browser = new wd.Builder().forBrowser('chrome').build();

async function GetStocks() {
    const stocks = ["IT", "Bank", "Auto", "Power"];
    let AverageReturns = [];
    for(let i = 0; i < stocks.length; i++) {
        await browser.get("https://top10stockbroker.com/" + "best-" + stocks[i] + "-stocks-to-buy");
        await browser.wait(wd.until.elementLocated(wd.By.css(".table-responsive")));
        let tables = await browser.findElements(wd.By.css(".table-responsive"));
        let myTable = tables[0];
        let Names = await myTable.findElements(wd.By.css("a"));
        let NamesArray = [];
        let URLs = [];
        for(let j = 0; j < Names.length; j++) {
            let Name = await Names[j].getAttribute("innerText");
            NamesArray.push(Name);
            let URL = await Names[j].getAttribute("href");
            URLs.push(URL);
        }

        let returns = [];
        let sectorAverageReturns = 0;
        for(let j = 0; j < URLs.length; j++) {
            await browser.get(URLs[j]);
            await browser.wait(wd.until.elementLocated(wd.By.css(".value.text-green")));
            let change = await browser.findElements(wd.By.css(".value.text-green"));
            let myChange = await change[0].getAttribute("innerText");
            returns.push({"Name" : NamesArray[j], "Returns" : myChange});
            sectorAverageReturns += parseFloat(myChange);
        }

        returns.sort(function(a,b) {
            return b.Returns - a.Returns;
        });

        let info = stocks[i] + " Sector :-" + "\n\n\r";
        let fileName = stocks[i] + ".txt";

        for(let k = 0; k < returns.length; k++) {
            info += JSON.stringify(returns[k]) + "\n\r";
        }

        fs.writeFileSync(fileName,info);

        sectorAverageReturns /= 10;
        AverageReturns.push({"Sector" : stocks[i], "AverageReturns" : sectorAverageReturns});
    }

    AverageReturns.sort(function(a,b) {
        return b.AverageReturns - a.AverageReturns;
    })

    let finalInfo = "Final Verdict :- \n\n\r" ;
    for(let i = 0; i < AverageReturns.length; i++) {
        finalInfo += JSON.stringify(AverageReturns[i]) + "\n\r";
    }

    fs.writeFileSync("FinalVerdict.txt", finalInfo);
}
    
GetStocks();
