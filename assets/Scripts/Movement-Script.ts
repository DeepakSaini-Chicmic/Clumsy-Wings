import {
  _decorator,
  Component,
  Node,
  lerp,
  UITransform,
  Prefab,
  NodePool,
  instantiate,
  Input,
  Vec3,
  randomRangeInt,
  UI,
  game,
  director,
  Button,
  Label,
} from "cc";
const { ccclass, property } = _decorator;

@ccclass("Movement_Script")
export class Movement_Script extends Component {
  count = 1;
  flagforcollision = 0;

  //   @property({ type: Node })
  //   Bird: Node;

  //   @property({ type: Node })
  //   Ground: Node;

  //   @property({ type: Node })
  //   Background: Node;

  @property({ type: Node })
  Background: Node;

  @property({ type: Node })
  Bird: Node;

  @property({ type: Node })
  GroundSprite: Node;

  @property({ type: Node })
  GameOver: Node;

  @property({ type: Prefab })
  Pipes: Prefab;

  @property({ type: Node })
  restart: Node;

  @property({ type: Node })
  Quit: Node;

  @property({ type: Node })
  Score: Node;

  @property({type:Node})
  KnockedOut:Node;

  totalScore: number;
  HurdleNodePool: NodePool = new NodePool();
  deltaTimeGlobal: number;
  onLoad() {
    this.totalScore = 0;

    for (let i = 0; i < 5; i++) {
      let newHurdle = instantiate(this.Pipes);
      newHurdle.name = "Hurdle";
      this.HurdleNodePool.put(newHurdle);
    }
    this.node.on(
      Input.EventType.TOUCH_START,
      () => {
        this.count = 0;
        this.schedule(this.BirdUpMovement, 0.05);
      },
      this
    );
    this.node.on(
      Input.EventType.TOUCH_END,
      () => {
        this.count = 1;
        this.unschedule(this.BirdUpMovement);
      },
      this
    );
  }

  onEnable() {
    this.GameOver.active = false;
    this.restart.active = false;
    this.Quit.active = false;
    this.KnockedOut.active= false;
  }
  start() {
    this.schedule(() => {
      this.AddingHurdle();
    }, 3);
  }

  //   BirdMovementOnClick(){
  //     if(this.count==0)
  //     {
  //         let BirdPosition:Vec3= this.Bird.getPosition();
  //         BirdPosition.y=BirdPosition.y+50;
  //         lerp(BirdPosition.y,BirdPosition.y+50,0.5);
  //         this.Bird.angle=10;
  //         this.Bird.setPosition(BirdPosition);
  //     }
  //   }
  BirdUpMovement() {
    if (this.count == 0) {
      let BirdPosition: Vec3 = this.Bird.getPosition();
      BirdPosition.y = lerp(BirdPosition.y, BirdPosition.y + 50, 0.5);
      this.Bird.angle = 10;
      // let BirdRotation=this.Bird.getRotation();
      // BirdRotation.z=20;
      // this.Bird.setRotation(BirdRotation);
      this.Bird.setPosition(BirdPosition);
    }
  }

  GroundMovement() {
    if (this.GameOver.active == false) {
      let InitialGroundPosition = 250;
      let GroundMovement = this.GroundSprite.getPosition();

      if (GroundMovement.x > -250) {
        GroundMovement.x -= 1;
      } else {
        console.log("Ground Started Again");

        GroundMovement.x = InitialGroundPosition;
      }
      this.GroundSprite.setPosition(GroundMovement);
    }
  }

  BirdDownMovement() {
    if (this.count == 1) {
      let BirdPosition: Vec3 = this.Bird.getPosition();
      // if(this.count==1){
      BirdPosition.y = lerp(BirdPosition.y,BirdPosition.y - 4,0.5);
      this.Bird.angle = -10;
      this.Bird.setPosition(BirdPosition);
      if (BirdPosition.y <= -210) {
        this.count = 0;
      }
    }
  }

  AddingHurdle() {
    if (this.HurdleNodePool.size() && this.GameOver.active == false) {
      let canvasWidth = this.node.getComponent(UITransform).contentSize.width;
      let newNode = this.HurdleNodePool.get();
      newNode.getChildByName("Score").active = true;
      //   newNode.setPosition(new Vec3(canvasWidth * 0.5 + newNode.getComponent(UITransform).contentSize.width * 0.5, 13 * randomRangeInt(-10, 10), 0));
      let newNodePosition = newNode.getPosition();
      // newNodePosition.y=newNodePosition.y-randomRangeInt(-10,10)*5;
      newNode.setPosition(564, newNodePosition.y - randomRangeInt(-10, 10) * 5);
      // let secondlastchild=this.node.children.length;
      // this.GroundSprite.setSiblingIndex(secondlastchild-1);
      this.node.addChild(newNode);
      console.log("Hurdle Added!");
    }
  }

  ReAddingHurdles() {
    if (this.GameOver.active == false) {
      this.node.children.forEach((child) => {
        if (child.name == "Hurdle") {
          var pos = child.getPosition();
          // console.log(pos.x);

          pos.x = pos.x - 1;
          let canvasWidth =
            this.node.getComponent(UITransform).contentSize.width;

          let hurdleWidth = child.getComponent(UITransform).contentSize.width;

          child.setPosition(pos);
          if (pos.x <= -1 * (canvasWidth * 0.5 + hurdleWidth * 0.5)) {
            this.HurdleNodePool.put(child);
          }
        }
      });
    }
  }

  CollisionDetection() {
    if (this.flagforcollision == 0) {
      let BirdRect = this.node
        .getChildByName("YellowBird")
        .getComponent(UITransform)
        .getBoundingBoxToWorld();
      let GroundRect = this.node
        .getChildByName("Ground")
        .getComponent(UITransform)
        .getBoundingBoxToWorld();
      if (BirdRect.intersects(GroundRect)) {
        console.log("Bird Collided on Ground");
        let lastchild = this.node.children.length;
        this.node.getChildByName("GameOver").setSiblingIndex(lastchild);
        this.GameOver.active = true;
        this.restart.active = true;
        this.Quit.active = true;
        this.KnockingOut();
        this.flagforcollision = 1;
        this.GamePause();
      }
      else if (this.node.children[8]) {
        let HurdleUpRect = this.node.children[8]
          .getChildByName("hurdleUp")
          .getComponent(UITransform)
          .getBoundingBoxToWorld();
        let HurdleDownRect = this.node.children[8]
          .getChildByName("hurdleDown")
          .getComponent(UITransform)
          .getBoundingBoxToWorld();

        if (BirdRect.intersects(HurdleUpRect)) {
          console.log("Bird Collided up");
          let lastchild = this.node.children.length;
          this.node.getChildByName("GameOver").setSiblingIndex(lastchild);
          this.GameOver.active = true;
          this.restart.active = true;
          this.Quit.active = true;
          this.KnockingOut();
          this.flagforcollision = 1;
          this.GamePause();
        }
        else if (BirdRect.intersects(HurdleDownRect)) {
          console.log("Bird Collided Down");
          let lastchild = this.node.children.length;
          this.node.getChildByName("GameOver").setSiblingIndex(lastchild);
          this.GameOver.active = true;
          this.restart.active = true;
          this.Quit.active = true;
          this.KnockingOut();
          this.flagforcollision = 1;
          this.GamePause();
          // this.node.on(Input.EventType.TOUCH_START,()=>{
          //   game.restart();
          // },this);
        }
        this.ScoreIncreaser();
      }
    }
  }

  ScoreIncreaser(){
    if (this.flagforcollision == 0) {
      let BirdRect = this.node
        .getChildByName("YellowBird")
        .getComponent(UITransform)
        .getBoundingBoxToWorld();
      if (this.node.children[8]){
        let scoreNode = this.node.children[8]
          .getChildByName("Score")
          .getComponent(UITransform)
          .getBoundingBoxToWorld();
        if (
          BirdRect.intersects(scoreNode) &&
          this.node.children[8].getChildByName("Score").active
        ) {
          this.node.children[8].getChildByName("Score").active = false;
          this.totalScore += 1;
          this.Score.getComponent(Label).string = this.totalScore.toString();
          console.log(
            "***************************************************************"
          );
          console.log("Total Score " + this.totalScore);
          console.log(
            "***************************************************************"
          );
        }
      }
    }
  }

  KnockingOut(){
    this.Bird.active=false;
    this.KnockedOut.setPosition(this.Bird.getPosition());
    this.KnockedOut.angle=this.Bird.angle;
    this.KnockedOut.active=true;
  }

  GamePause() {
    game.pause();
    this.restart.on(
      Input.EventType.TOUCH_START,
      () => {
        // director.preloadScene("StartGameScene");
        game.resume();
        director.loadScene("StartGameScene");
      },
      true
    );
    this.Quit.on(
      Input.EventType.TOUCH_START,
      () => {
        game.end();
      },
      true
    );
  }
  GameRestart() {}

  //   MoveHurdle(hurlde: Node, deltaTime: number) {
  //     let currPosOfHurdle_1 = hurlde.getPosition();
  //     currPosOfHurdle_1.x -= deltaTime * 100;
  //     hurlde.setPosition(currPosOfHurdle_1);

  //     console.log("Move function called!");
  //     console.log(currPosOfHurdle_1);

  //     if (currPosOfHurdle_1.x + 480 <= 0) {
  //       currPosOfHurdle_1.x = 480.156;
  //       hurlde.setPosition(currPosOfHurdle_1);
  //     }
  //   }

  //   BirdDownMovement() {
  //     if(this.count==1){
  //     let BirdPosition:Vec3 = this.Bird.getPosition();
  //     BirdPosition.y -= 1;
  //     this.Bird.angle=-10;
  //     this.Bird.setPosition(BirdPosition);
  //     if(BirdPosition.y<=-164)
  //     {
  //         console.log("Bird Fallen");
  //         this.count=1;

  //     }
  //     }
  //   }

  //   GroundMovement() {
  //     let InitialGroundPosition = 220;
  //     let GroundPosition = this.Ground.getPosition();
  //     let CanvasWidth = this.node.getComponent(UITransform).width;
  //     if (GroundPosition.x > -371) {
  //       GroundPosition.x -= 4.5;
  //     } else {
  //       GroundPosition.x = InitialGroundPosition;
  //     }
  //     this.Ground.setPosition(GroundPosition);
  //   }

  //   BackGroundMovement() {
  //     let BackgroundPosition = this.Background.getPosition();
  //     let CanvasWidth = this.node.getComponent(UITransform).width;
  //     if (BackgroundPosition.x > -371) {
  //       BackgroundPosition.x -= 0.5;
  //     } else {
  //       BackgroundPosition.x = 371;
  //     }
  //     this.Background.setPosition(BackgroundPosition);
  //   }
  update(deltaTime: number) {
    this.BirdDownMovement();
    this.GroundMovement();
    // this.BackGroundMovement();
    this.deltaTimeGlobal = deltaTime;
    this.ReAddingHurdles();
    this.CollisionDetection();
  }
}
