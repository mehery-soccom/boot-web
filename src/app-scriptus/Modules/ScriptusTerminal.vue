<template>
      <main class="terminal_container">
        <div class="terminal">
          <!-- Terminal Bar -->       
          <section class="terminal__bar">  
            <slot name="terminalbar">
                <div class="bar__buttons">            
                  <button class="bar__button bar__button--exit">&#10005;</button>            
                  <button class="bar__button">&#9472;</button>                
                  <button class="bar__button">&#9723;</button>          
                </div>          
                <p class="bar__user">{{user}}: ~</p>   
            </slot>          
          </section>        
          <!-- Terminal Body -->        
          <section class="terminal__body" ref="terminal__body">          
            <div v-for="(m,i) in visibleMessage" v-bind:key="i" class="terminal__prompt">            
              <span class="terminal__prompt--user">{{system}}:</span>            
              <span class="terminal__prompt--location">~</span>            
              <span class="terminal__prompt--bling">$</span>            
              <span class="terminal__prompt--bling">&nbsp;</span>
              <span class="terminal__prompt--bling">{{m}}</span> 
            </div>     
            <div class="terminal__prompt">            
              <span class="terminal__prompt--user">{{system}}:</span>            
              <span class="terminal__prompt--location">~</span>            
              <span class="terminal__prompt--bling">$</span>            
              <span class="terminal__prompt--cursor"></span>          
            </div>    
          </section>      
        </div>    
      </main>
</template>
<script>

    export default {
        components: {
        },
        props : {
          user : {}, system : {},
          logs : {}
        },
        data: () => ({
          scrollBottom : 0
        }),
        computed : {
          visibleMessage(){
            let end = this.logs.length;
            let start = end > 100 ? (end-100) : 0;

            return this.logs.slice(start,end).map(function(args){
                let msg = [];
                for(var i in args){
                  if(typeof args[i] == 'object'){
                    msg.push(JSON.stringify(args[i]));
                  } else {
                    msg.push(args[i]);
                  }
                }
                return msg.join(" ");
            }); 
          }
        },
        beforeUpdate : function(){
          this.scrollBottom = this.$refs.terminal__body.scrollHeight - this.$refs.terminal__body.scrollTop;
          console.log("update:before",this.scrollBottom)
        },
        updated : function(){
          console.log("update:after",this.scrollBottom);
          this.$refs.terminal__body.scrollTop = this.$refs.terminal__body.scrollHeight-this.scrollBottom;
        },
        created : function (argument) {
         // console.log("created",this.$refs.editor.clientHeight)
        },
        mounted : function (argument) {
          let THAT = this;
          this.$refs.terminal__body.addEventListener('scroll', function(){
              THAT.scrollBottom = THAT.$refs.terminal__body.scrollHeight - THAT.$refs.terminal__body.scrollTop;
          });
          this.load()
        },
        methods : {
          async load (){
          },
          adJustScroll(){
          }
        }
    }
</script>
<style lang="scss">
  @import url('https://fonts.googleapis.com/css?family=Ubuntu');
  @import url('https://fonts.googleapis.com/css?family=Ubuntu+Mono');

.terminal_container {  
  display: flex;  
  justify-content: center;  
  align-items: center;  
  height: 100%;

    .terminal {  
      width: 100%;  
      height: 100%;  
      box-shadow: 2px 4px 10px rgba(0,0,0,0.5);
    } 
    .terminal__bar {  
      display: flex;  
      width: 100%;  
      height: 30px;  
      align-items: center;  
      padding: 0 8px;  
      box-sizing: border-box;  
      border-top-left-radius: 0px;  
      border-top-right-radius: 0px;  
      background: linear-gradient(#504b45 0%,#3c3b37 100%);
      justify-content: space-between;
    } 
    .bar__buttons {  
      display: flex;  
      align-items: center;
    } 
    .bar__button {  
      display: flex;  
      justify-content: center;  
      align-items: center;  
      padding: 0;  
      margin-right: 5px;  
      font-size: 8px;  
      height: 12px;  
      width: 12px;  
      box-sizing: border-box;  
      border: none;  
      border-radius: 100%;  
      background: linear-gradient(#7d7871 0%, #595953 100%);  
      text-shadow: 0px 1px 0px rgba(255,255,255,0.2);  
      box-shadow: 0px 0px 1px 0px #41403A, 0px 1px 1px 0px #474642;
    }
    .bar__button:hover {  
      cursor: pointer;
    }
    .bar__button:focus {  
      outline: none;
    }
    .bar__button--exit {  
      background: linear-gradient(#f37458 0%, #de4c12 100%);    
      background-clip: padding-box;
    } 
    .bar__user {   
      color: #d5d0ce;  
      margin: 5px 5px;  
      font-size: 14px;  
      line-height: 15px;
    } 
    .terminal__body {  
      background: rgba(29, 30, 25,1);
      // background: rgba(56, 4, 40, 0.9);  
      font-family: 'Ubuntu Mono';  
      height: calc(100% - 30px);  
      padding-top: 2px;  
      margin-top: -1px;
      overflow-x: scroll;
    } 
    .terminal__prompt {  
      display: flex;
    }
    .terminal__prompt--user {  
      color: #7eda28;
    }
    .terminal__prompt--location { 
      color: #4878c0;
    }
    .terminal__prompt--bling {  
      color: #dddddd;
      word-break: break-word;
      overflow-wrap: break-word;
      white-space: pre;
      white-space: pre-line
    }
    .terminal__prompt--cursor {  
      display: block;  
      height: 17px;  
      width: 8px;  
      margin-left: 9px;  
      animation: blink 1200ms linear infinite;
    } 
    @keyframes blink {  
      0% {    
        background: #ffffff;  
      }  
      49% {    
        background: #ffffff;  
      }  
      60% {    
        background: transparent;  
      }  
      99% {    
        background: transparent;  
      }  100% {    
        background: #ffffff;  
      }
    } 
    @media (max-width: 600px) {  
      .terminal {    
        max-height: 90%;    
        width: 90%;  
      }
    }



} 



</style>
