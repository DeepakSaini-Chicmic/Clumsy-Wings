import { _decorator, Component, Node, Input, director } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('StartGameScript')
export class StartGameScript extends Component {
    @property({type:Node})
    StartButton:Node;
    
    onLoad(){
        director.preloadScene("Gameplay");

        this.StartButton.on(Input.EventType.TOUCH_START,()=>{
            director.loadScene("Gameplay"),this
        })
    }
    start() {

    }

    update(deltaTime: number) {
        
    }
}


