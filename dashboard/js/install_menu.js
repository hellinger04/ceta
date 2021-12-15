//  FROM index_menu_template.html JUNE 21 2021
    const iframes = document.getElementById("iframes");
    const check_button_group = document.getElementById("check_button_group");
    const installBtn = document.getElementById('installBtn');
    const buttonAllLoaded = document.getElementById('buttonAllLoaded');
    const buttonNotLoaded = document.getElementById('buttonNotLoaded');
    const installStatusHeading = document.getElementById('installStatusHeading');
    const checkBtnDiv = document.getElementById('checkBtnDiv');
    const loadStatusDiv = document.getElementById('loadStatusDiv');
    const elementIframeWindows = document.getElementById('elementIframeWindows');
    const progressDiv = document.getElementById('progressDiv');
    const waitClock = document.getElementById('waitClock');
    const startClock = document.getElementById('startClock');
    const installStatusDiv = document.getElementById('installStatusDiv');

    var clockTime = new Date();
    const startSeconds = Math.round(clockTime.getTime()/1000); // milliseconds
    const waitTime = 4/4; // 4
    const installTime = 30/10; // 30 for triggering persistent data

    class InstallerData{
      constructor() {
        this.data = {}; 
        this.data.userInteractions = [];
        this.data.navigatorSW_URL = "";
        this.data.navigatorSW_state = "";
        this.data.connectionSpeed = [];
      }
      initialize() {
        this.addNavigator();
        this.addNavigator(navigator.connection,"navigatorConnection");
        this.addNavigator(navigator.userAgentData,"navigatorUserAgentData");
        this.addNavigator(window.screen,"windowScreen");
        this.checkConnectionSpeed();
      }
      addInteraction(eventDescription) {
        this.data.userInteractions.push({eventDescription: eventDescription, time: Date.now().toString()});
      }
      addObject(object,name) {
        this.data[name] = JSON.stringify(object);
      }
      addNavigator(navigatorObject=navigator,name="navigatorData") {
        let navigatorObjectData = {};
        if (typeof navigatorObject !== "undefined") {
          for (let key in navigatorObject) {
            if (typeof navigatorObject[key] !== "function") {
              navigatorObjectData[key] = navigatorObject[key];
            }
          }
        }
        if (typeof this.data[name] == "undefined") {this.data[name] = [];}
        this.data[name].push(JSON.stringify(navigatorObjectData));
      }
      checkServiceWorker() {
        let SW_state = "";
        if (navigator.serviceWorker.controller) {
          this.navigatorSW_URL = navigator.serviceWorker.controller.scriptURL;
          SW_state = navigator.serviceWorker.controller.state;
          this.navigatorSW_state = SW_state;
          installerData.addObject(
            { 
              navigatorSW_URL: this.navigatorSW_URL,
              navigatorSW_state: SW_state,
            },
            "navigatorController"
          );
        }
        return SW_state;
      }
      writeDataToDB() {
        writeData(this.data);
      }
      syncDataToDB() {
        sync_pdb();
      }
      async saveInstallationStatus(installStatus) { // user input of installation status
        await writeData({installStatus: installStatus});
      }
      async getInstallationStatus() { // called onload only
        let installStatusSaved = await readAllData();
        console.log('readAllData:',installStatusSaved);
        return installStatusSaved;
      }
      async checkConnectionSpeed() {
        let speed = await navigator.connection.downlink;
        let speedDescription;
        if (speed == 10) {
          speedDescription = 'More than ' + speed + ' Mbps';
        } else {
          speedDescription = speed + ' Mbps';
        }
        this.data.connectionSpeed.push({
          connectionSpeedDescription: speedDescription,
        });
        console.log('Connection speed:', speedDescription);
      }
    }

    // var installerData = {};
    var installerData = new InstallerData();

    const timeOut = (i,dom,begin) => new Promise(resolve => {
      let timeInterval = begin ? 1 : 1000;
      setTimeout(() => {
          resolve(dom.innerHTML = `Ready in ${i} seconds...`);
        }, timeInterval);
    })

    // SEQUENCE OF EVENTS: startClock, installerDiv, waitClock, waitSW

    async function startClockFn() {
      installerData.addInteraction('startClockFn()');
      document.getElementById('startClockBtn').style.display = "none";
      for (let i=waitTime; i>0; i--) {
        await timeOut(i,startClock,i==waitTime);
      }
      startClock.style.display = "none";
      installerDiv.style.display = "block";
    }

    async function installerSubmit() {
      installerData.addInteraction('installerSubmit()');
      let storageEstimate = await navigator.storage.estimate();
      installerData.addObject(
        {
          country: document.getElementById("CountryInfo").value, // SHORTEN INSTALLER INFO
          // region: document.getElementById("RegionInfo").value,
          // dohort: document.getElementById("CohortInfo").value,
          // date: document.getElementById("DateInfo").value,
          storageQuota: storageEstimate.quota,
          storageUsage: storageEstimate.usage,
          storageDetails: storageEstimate.usageDetails,
        },
        "installationData"
      );
      let currentTime = new Date();
      const currentSeconds = Math.round(currentTime.getTime()/1000);
      const remainingSeconds = installTime - waitTime - (currentSeconds-startSeconds); // need 30 seconds of user engagement
      for (let i=remainingSeconds; i>0; i--) {
        await timeOut(i,installerDiv,i==remainingSeconds);         
      }
      installerDiv.style.display = "none";
      waitClock.style.display = "block";        
    }

    async function waitClockFn() {
      installerData.addInteraction('waitClockFn()');
      let currentTime = new Date();
      const currentSeconds = Math.round(currentTime.getTime()/1000);
      const remainingSeconds = installTime - (currentSeconds-startSeconds); // need 30 seconds of user engagement
      for (let i=remainingSeconds; i>0; i--) {
        await timeOut(i,waitClock,i==remainingSeconds);         
      }
      waitClock.style.display = "none";
      progressDiv.style.display = "block";
    }

    async function waitSW() {
      installerData.addInteraction('waitSW()');
      const remainingSeconds = 10/10; // if too much delay, the install button will not show up
      let SW_state = "";
      for (let i=remainingSeconds; i>0; i--) {
        await timeOut(i,installStatusHeading,i==remainingSeconds);         
        SW_state = installerData.checkServiceWorker();
        console.log('waitSW() > SW_state:',SW_state);
        if (SW_state == "activated") {break;}
      }
      installStatusHeading.innerHTML = (SW_state == "activated") ? "If you don't see an install button soon, then go to Step 2 and click on the right button" : "Go to Step 2 and click on the right button";
    }

    // ADD TO HOMESCREEN PROMPT, NEEDED FOR PERSISTENT STORAGE
    var installSuccess = false;
    var persistSuccess = false;

    var InstallDB;
    const installName = 'Installation_Status';

    async function checkPersistence() { // if persistent, set flag and then show elements
        installStatusHeading.innerHTML = 'Checking memory...'
        let persistent = await persistentCheck(); // in main.js
        if (persistent) { // install success and persistent
          installStatusHeading.innerHTML = 'Finished step 1.  Go to step 2.';
          persistSuccess = true;
        } else {
          persistSuccess = false;
        }
        await show_elements();
    }

    buttonAllLoaded.addEventListener('click',async function () { // NEED TO DO A FINAL CHECK, then show menu
      installerData.addInteraction('buttonAllLoaded()');
      await show_elements(); // one final check
      show_user_menu();
    });

    buttonNotLoaded.addEventListener('click',async function () {
      installerData.addInteraction('buttonNotLoaded()');
      await show_elements(); // fill the iframes again
    });

    function show_elements() { // show element loading iframes, 
      removeAllChildNodes(iframes);
      // checkBtnDiv.style.display = "block";
      progressDiv.style.display = "block";
      installStatusDiv.style.display = "none";
      elementIframeWindows.style.display = "block";
      for (let element of elements) {
        const element_lc = element.toLowerCase();
        // var li_element = document.createElement("li");
        let iframe_element = document.createElement("iframe");
        let iframe_div = document.createElement("div"); 
        // li_element.style.margin = "15px";
        // had strange problems with a_element_href being replaced by a_element.href in the browser
        let a_elementhref = `https://ceta-ukraine-${element_lc}-dev.web.app/index_${element}.html`; // use Cache Storage, not ?t=${Date.now().toString()}

        iframe_div.className = 'container-responsive-iframe';
        iframe_element.src = a_elementhref + '?check_videos="true"'; // firebase does not recognize check_videos=true
        iframe_element.name = `iFrame_${element}`;
        iframe_element.id = `iFrame_${element}`;
        iframe_element.className = 'responsive-iframe';
        iframe_element.scrolling = 'no';
        iframe_div.appendChild(iframe_element);
        iframes.appendChild(iframe_div);
      }
    }

    // window.addEventListener('appinstalled', () => { // UNUSED, deprecated on other browsers, Chrome may continue to support
    //   console.log('index_menu was installed');
    //   // show_elements();
    // })

    window.onload = async () => { // sw register, install db, get install status, if installed, check persistent, if persistent, show elements
      // console.log('index_menu window.onload');


      if (typeof installStatus == "undefined") {
        console.log("***** LOCAL VERSION SO DON'T DO INSTALL *****"); // can insert code for only local version
        show_user_menu();
        let href = 'https://cetatest.ngrok.io/directory?subdir=public/base/public'; // NOT_APK
        let a_element = user_menu_button(href,'Refresh files'); // NOT_APK
        menu_elements.insertBefore(a_element,menu_elements.childNodes[0]); // NOT_APK
        return;
      } // prevent remainder of code from running if local
      installerData.addObject(
        {
          installSuccess: installSuccess,
          persistSuccess: persistSuccess,
        },
        "installationSuccess"
      );
      await installerData.saveInstallationStatus(installStatus);
      await installerData.writeDataToDB();
      await installerData.syncDataToDB();
      // sync_pdb();
      console.log('installStatus:',installStatus);

      if (installStatus) {
        installSuccess = true;
        startClock.style.display = "none";
        document.getElementById("loadStatusHeader").innerHTML = "Check installation";
        await checkPersistence();
        await show_elements();
        // go to menu
      } else { // INSTALL
        installSuccess = false;
        var deferredPrompt;
        installBtn.style.display = 'hidden';
        installBtn.style['z-index'] = -1;
        // await waitSW(); // if too much delay, no install button
        let SW_state = await installerData.checkServiceWorker();
        installStatusHeading.innerHTML = (SW_state == "activated") ? "If you don't see an install button soon, then go to Step 2 and click on the right button" : "Go to Step 2 and click on the right button";

        window.addEventListener('beforeinstallprompt', (e) => { // this may be needed after onload
          // Prevent Chrome 67 and earlier from automatically showing the prompt
          e.preventDefault();
          // Stash the event so it can be triggered later.
          deferredPrompt = e;
          // Update UI to notify the user they can add to home screen
          installBtn.style.display = 'block';
          installBtn.style['z-index'] = 1;

          installBtn.addEventListener('click', async () => {
            // hide our user interface that shows our A2HS button
            installBtn.style.display = 'none';
            installStatusHeading.innerHTML = 'Please click on the install button.'
            // Show the prompt
            deferredPrompt.prompt();
            // Wait for the user to respond to the prompt
            deferredPrompt.userChoice.then( async (choiceResult) => {
              if (choiceResult.outcome === 'accepted') {
                console.log('User accepted the A2HS prompt');
                deferredPrompt = null;
                installerData.addInteraction('install prompt accepted');
                await installerData.saveInstallationStatus(true); // store 1 in installation status db
                await installerData.writeDataToDB();
                await installerData.syncDataToDB();
                await checkPersistence();
                await show_elements(); // show twice
              } else {
                installerData.addInteraction('install prompt rejected');
                console.log('User dismissed the A2HS prompt');
                await installerData.saveInstallationStatus(false); // store 1 in installation status db
                await installerData.writeDataToDB();
                await installerData.syncDataToDB();
                deferredPrompt = null;
                let sws = await navigator.serviceWorker.getRegistrations();
                for (let sw of sws) {
                  await sw.unregister();
                }; 
                location.reload(true);
              }
            });
          });
        });
      }
    }
