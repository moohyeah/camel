'use client'

import Head from 'next/head'
import Script from 'next/script'

import { ConnectButton } from "arweave-wallet-kit";

import { connect, createDataItemSigner } from "@permaweb/aoconnect";

const { result, results, message, spawn, monitor, unmonitor, dryrun } = connect(
  {
    MU_URL: "https://mu.ao-testnet.xyz",
  },
);

function LoginForm(){
  return (
    <div className='fixed-center-container'>
      <ConnectButton
        profileModal={false}
        showBalance={true}
      />
    </div>    
  );
}

async function testMsg() {
  await message({
    /*
      The arweave TXID of the process, this will become the "target".
      This is the process the message is ultimately sent to.
    */
    process: "2RLwmjFijKkoRko-9Mr6aJBQFRaV1OB3Q8IeOFNuqRI",
    // Tags that the process will use as input.
    tags: [
      { name: "Your-Tag-Name-Here", value: "your-tag-value" },
      { name: "Another-Tag", value: "another-value" },
    ],
    // A signer function used to build the message "signature"
    signer: createDataItemSigner(globalThis.arweaveWallet),
    /*
      The "data" portion of the message.
      If not specified a random string will be generated
    */
    data: "any data",
  })
    .then(console.log)
    .catch(console.error);
}
export default function Home() {
  return (
    <>
    <Head>
      <meta charSet="utf-8" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      <meta name="format-detection" content="telephone=no" />

      <meta name="renderer" content="webkit"/>
      <meta name="force-rendering" content="webkit"/>
      <meta httpEquiv="X-UA-Compatible" content="IE=edge,chrome=1"/>
      <meta name="msapplication-tap-highlight" content="no" />
      <meta name="full-screen" content="yes"/>
      <meta name="x5-fullscreen" content="true"/>
      <meta name="360-fullscreen" content="true"/>
      <link rel="shortcut icon" href="TemplateData/favicon.ico" />
    </Head>
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        height: '100%',
        width: '100%',
      }}
    >
      <canvas id="unity-canvas"></canvas>
      <div id="unity-loading-bar">
        <div id="unity-logo"></div>
        <div id="unity-progress-bar-empty">
          <div id="unity-progress-bar-full"></div>
        </div>
      </div>
      <div id="unity-warning"> </div>
      <div id="unity-footer" style= {{display : "none"}}>
        <div id="unity-webgl-logo"></div>
        <div id="unity-fullscreen-button"></div>
        <div id="unity-build-title">puzzlegame_telegram</div>
      </div>
    </div>
    <LoginForm />
    <Script strategy='lazyOnload' id="game-script">
      {`
      var container = document.querySelector("#unity-container");
      var canvas = document.querySelector("#unity-canvas");
      var loadingBar = document.querySelector("#unity-loading-bar");
      var progressBarFull = document.querySelector("#unity-progress-bar-full");
      var fullscreenButton = document.querySelector("#unity-fullscreen-button");
      var warningBanner = document.querySelector("#unity-warning");
      var defaultHeight = 1280;
      var defaultWidth = 720;
      var h = defaultHeight;
      var w = defaultWidth;

      function unityShowBanner(msg, type) {
        function updateBannerVisibility() {
          warningBanner.style.display = warningBanner.children.length ? 'block' : 'none';
        }
        var div = document.createElement('div');
        div.innerHTML = msg;
        warningBanner.appendChild(div);
        if (type == 'error') div.style = 'background: red; padding: 10px;';
        else {
          if (type == 'warning') div.style = 'background: yellow; padding: 10px;';
          setTimeout(function() {
            warningBanner.removeChild(div);
            updateBannerVisibility();
          }, 5000);
        }
        updateBannerVisibility();
      }

      // var buildUrl = "https://api.zkfairy.com/weblib";
      var buildUrl = "Build";
      var loaderUrl = buildUrl + "/wb.loader.js";
      var config = {
        dataUrl: buildUrl + "/wb.data.unityweb",
        frameworkUrl: buildUrl + "/wb.framework.js.unityweb",
        codeUrl: buildUrl + "/wb.wasm.unityweb",
        streamingAssetsUrl: "StreamingAssets",
        companyName: "DefaultCompany",
        productName: "puzzlegame_telegram",
        productVersion: "1.0",
        showBanner: unityShowBanner,
        cacheControl: function(url) {
          // Caching enabled for .data and .bundle files. 
          // Revalidate if file is up to date before loading from cache
          if (url.match(/\.data/) || url.match(/\.unityweb/)) {
            return "must-revalidate";
          }
  
          // Caching enabled for .mp4 and .custom files
          // Load file from cache without revalidation.
          if (url.match(/\.mp4/) || url.match(/\.custom/)) {
            return "immutable";
          }
  
          // Disable explicit caching for all other files.
          // Note: the default browser cache may cache them anyway.
          return "no-store";
        },
      };

      if (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
        h = window.innerHeight;
        w = window.innerWidth;
        // Mobile device style: fill the whole browser client area with the game canvas:
    
        // To lower canvas resolution on mobile devices to gain some
        // performance, uncomment the following line:
        // config.devicePixelRatio = 1;
    
        // unityShowBanner('WebGL builds are not supported on mobile devices.');
      } else {
        // Desktop style: Render the game canvas in a window that can be maximized to fullscreen:
        var height = window.innerHeight;
        var width = window.innerWidth;
       
    
        if(width < height * defaultWidth / defaultHeight) {
          h = width * defaultHeight / defaultWidth;
          w = width;
        }
        else {
          h = height;
          w = height * defaultWidth / defaultHeight;
        }
      }
      var canvas = document.querySelector("#unity-canvas");
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";

      loadingBar.style.display = "block";

      var script = document.createElement("script");
      script.src = loaderUrl;
      script.onload = () => {
        createUnityInstance(canvas, config, (progress) => {
          progressBarFull.style.width = 100 * progress + "%";
        }).then((unityInstance) => {
          window.unityInstance = unityInstance
          loadingBar.style.display = "none";
          fullscreenButton.onclick = () => {
            unityInstance.SetFullscreen(1);
          };
        }).catch((message) => {
          alert(message);
        });
      };
      document.body.appendChild(script);
      `}
    </Script>
    </>
  );
}
