// 棋子
class ChessPieces {
  id = ''
  x = 0
  y = 0
  factions = '' // R/B
  text = ''
  terminator = false
  constructor(f, text) {
    this.factions = f
    this.text = text
    this.id = text + Math.floor(Math.random() * 10000000) + new Date().getTime()
  }

  getLoc() { return this.x + txtIn + this.y }

  // 随机出生地
  getRandomBirthplace() {
    let hadDot = getHadDot()
    let x = 0
    let y = 0
    do{
      x = Math.floor(Math.random() * 9);
      y = Math.floor(Math.random() * 10);
    }while( (mine && (x+txtIn+y) === mine.getLoc()) || hadDot.indexOf(x+txtIn+y) >= 0 )
    this.x = x
    this.y = y
    this.draw(0)
  }

  // 计算出生位
  getCountBirthplace(list) {
    if(bout < 2) {
      this.getRandomBirthplace()
      return
    }
    if(list.length === 0) { // 无需救子则随机
      this.getRandomBirthplace()
      return
    }
    let res = false
    for(let i = 0; i < list.length; i++) {
      if(dotStatus(list[i].loc)) {
        this.x = list[i].x
        this.y = list[i].y
        res = true
        break
      }
    }
    // 计算失败则随机
    if(res) {
      this.draw(0)
    } else this.getRandomBirthplace()
  }

  // 绘制棋子
  draw(isReset = 1) {
    if(isReset === 1) reset(this.id)
    let color = this.factions === factions.R ? '255,0,0' : '51,51,51';
    if(this.text === '将' || (hadSkill && this.factions === factions.R)) color = skillColor
    // 底座
    ctx.strokeStyle = this.terminator ?  `rgb(255,255,255)` : `rgb(${color})`;
    ctx.fillStyle = this.terminator ? `rgb(0,0,0)` : `rgb(255,255,255)`;
    ctx.beginPath();
    ctx.arc(padding + width * this.x, padding + height * this.y, chessRadius, 0, Math.PI * 2, false);
    ctx.fill()
    ctx.closePath();
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(padding + width * this.x, padding + height * this.y, chessRadius * 0.8, 0, Math.PI * 2, false);
    ctx.closePath();
    ctx.stroke();
    // 字
    if(this.terminator) ctx.strokeStyle = `rgb(255,255,255)`;
    ctx.font = '20px Fangsong'
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.strokeText(this.text, padding + width * this.x, padding + height * this.y)
  }

  // 移动
  move(x, y) {
    let dis = dotDistance({x:this.x, y:this.y}, {x,y})
    let moveTime = (Math.round(dis) || 1) * moveTotalTime
    let sqrtX = (x - this.x) / (moveTime / moveInterval)
    let sqrtY = (y - this.y) / (moveTime / moveInterval)
    return new Promise((resolve) => {
      const si = setInterval(() => {
        this.x += sqrtX
        this.y += sqrtY
        this.draw()
      }, moveInterval);
      setTimeout(() => {
        this.x = x
        this.y = y
        this.draw()
        clearInterval(si)
        resolve()
      }, moveTime)    
    })
  }
}

// 車
class Car extends ChessPieces {
  score = 50
  interval = 5
  constructor(f) {
    super(f, '車')
    if(birthRandom() === 1 && f !== factions.R) {
      this.getBirthplace()
    } else this.getRandomBirthplace()
  }

  // 可攻击点
  getCanAttackDot() {
    let list = [...chessList, mine].filter(x => x.factions !== this.factions).map(x => x.getLoc())
    return this.getCanMoveDot().filter(x => list.indexOf(x) >= 0) || []
  }

  // 可移动点
  getCanMoveDot() {
    let hadDot = getHadDot()
    let res = []
    // 横
    for(let i = this.x - 1; i >= 0; i--) {
      res.push(i + txtIn + this.y)
      if(hadDot.indexOf(i + txtIn + this.y) >= 0) break
    }
    for(let i = this.x + 1; i < 9; i++) {
      res.push(i + txtIn + this.y)
      if(hadDot.indexOf(i + txtIn + this.y) >= 0) break
    }
    // 竖
    for(let i = this.y - 1; i >= 0; i--) {
      res.push(this.x + txtIn + i)
      if(hadDot.indexOf(this.x + txtIn + i) >= 0) break
    }
    for(let i = this.y + 1; i < 10; i++) {
      res.push(this.x + txtIn + i)
      if(hadDot.indexOf(this.x + txtIn + i) >= 0) break
    }
    return res
  }

  // 计算出生位
  getBirthplace() {
    let res = []
    let list = mine.getCanAttackDot() || []
    if(list.length > 0) {
      for(let i = 0; i < list.length; i++) {
        let x = Number(list[i].split(txtIn)[0])
        let y = Number(list[i].split(txtIn)[1])
        res.push(
          {x: x-1, y: y, loc: (x-1)+txtIn+y},
          {x: x, y: y+1, loc: x+txtIn+(y+1)},
          {x: x+1, y: y, loc: (x+1)+txtIn+y},
          {x: x, y: y-1, loc: x+txtIn+(y-1)},
        )
      }
    }
    this.getCountBirthplace(res)
  }

  // 棋子移动 1躲；2攻击
  chessMove(type) {
    let list = type === 1 ? this.getCanMoveDot() : this.getCanAttackDot()
    let res = getMoveDot(list, type)
    return new Promise(async (resolve) => {
      if(res) {
        if(type === 2 )this.terminator = true
        await this.move(res.x, res.y)
        resolve(true)
      } else resolve(false)
    })
  }
}

// 象
class Elephant extends ChessPieces {
  score = 30
  interval = 4
  constructor(f) {
    super(f, '象')
    if(birthRandom() === 1) {
      this.getBirthplace()
    } else this.getRandomBirthplace()
  }

  // 可攻击点
  getCanAttackDot() {
    let list = [...chessList, mine].filter(x => x.factions !== this.factions).map(x => x.getLoc())
    return this.getCanMoveDot().filter(x => list.indexOf(x) >= 0) || []
  }

  // 可移动点
  getCanMoveDot() {
    let hadDot = getHadDot()
    let res = []
    // 拌象腿
    let lt = hadDot.indexOf((this.x-1) + txtIn + (this.y-1)) >= 0
    let lb = hadDot.indexOf((this.x+1) + txtIn + (this.y-1)) >= 0
    let rt = hadDot.indexOf((this.x-1) + txtIn + (this.y+1)) >= 0
    let rb = hadDot.indexOf((this.x+1) + txtIn + (this.y+1)) >= 0
    if(hadDot.indexOf((this.x-2) + txtIn + (this.y-2)) < 0 && !lt) res.push((this.x-2) + txtIn + (this.y-2))
    if(hadDot.indexOf((this.x-2) + txtIn + (this.y+2)) < 0 && !rt) res.push((this.x-2) + txtIn + (this.y+2))
    if(hadDot.indexOf((this.x+2) + txtIn + (this.y+2)) < 0 && !rb) res.push((this.x+2) + txtIn + (this.y+2))
    if(hadDot.indexOf((this.x+2) + txtIn + (this.y-2)) < 0 && !lb) res.push((this.x+2) + txtIn + (this.y-2))
    return res
  }

  // 计算出生位
  getBirthplace() {
    let res = []
    let list = mine.getCanAttackDot() || []
    if(list.length > 0) {
      for(let i = 0; i < list.length; i++) {
        let x = Number(list[i].split(txtIn)[0])
        let y = Number(list[i].split(txtIn)[1])
        res.push(
          {x: x-2, y: y-2, loc: (x-2)+txtIn+(y-2)},
          {x: x+2, y: y+2, loc: (x+2)+txtIn+(y+2)},
          {x: x+2, y: y-2, loc: (x+2)+txtIn+(y-2)},
          {x: x-2, y: y+2, loc: (x-2)+txtIn+(y+2)},
        )
      }
    }
    this.getCountBirthplace(res)
  }

  // 棋子移动 1躲；2攻击
  chessMove(type) {
    let list = type === 1 ? this.getCanMoveDot() : this.getCanAttackDot()
    let res = getMoveDot(list, type)
    return new Promise(async (resolve) => {
      if(res) {
        if(type === 2 )this.terminator = true
        await this.move(res.x, res.y)
        resolve(true)
      } else resolve(false)
    })
  }
}

// 炮
class Gun extends ChessPieces {
  score = 40
  interval = 4
  constructor(f) {
    super(f, '炮')
    if(birthRandom() === 1) {
      this.getBirthplace()
    } else this.getRandomBirthplace()
  }

  // 可攻击点
  getCanAttackDot() {
    let list = [...chessList, mine].filter(x => x.factions !== this.factions).map(x => x.getLoc())
    return this.getCanMoveDot(2).filter(x => list.indexOf(x) >= 0) || []
  }

  // 可移动点 1移动；2攻击
  getCanMoveDot(type = 1) {
    let hadDot = getHadDot()
    let res = []
    let atkRes = []
    let allList = [mine, ...chessList]
    // 横
    for(let i = this.x - 1; i >= 0; i--) {
      res.push(i + txtIn + this.y)
      if(hadDot.indexOf(i + txtIn + this.y) >= 0) {
        let item = allList.filter(x => x.y === this.y && x.x < i).sort((x, y) => y.x - x.x)
        if(item.length > 0) atkRes.push(item[0].getLoc())
        break
      }
    }
    for(let i = this.x + 1; i < 9; i++) {
      res.push(i + txtIn + this.y)
      if(hadDot.indexOf(i + txtIn + this.y) >= 0) {
        let item = allList.filter(x => x.y === this.y && x.x > i).sort((x, y) => x.x - y.x)
        if(item.length > 0) atkRes.push(item[0].getLoc())
        break
      }
    }
    // 竖
    for(let i = this.y - 1; i >= 0; i--) {
      res.push(this.x + txtIn + i)
      if(hadDot.indexOf(this.x + txtIn + i) >= 0) {
        let item = allList.filter(x => x.x === this.x && x.y < i).sort((x, y) => y.y - x.y)
        if(item.length > 0) atkRes.push(item[0].getLoc())
        break
      }
    }
    for(let i = this.y + 1; i < 10; i++) {
      res.push(this.x + txtIn + i)
      if(hadDot.indexOf(this.x + txtIn + i) >= 0) {
        let item = allList.filter(x => x.x === this.x && x.y > i).sort((x, y) => x.y - y.y)
        if(item.length > 0) atkRes.push(item[0].getLoc())
        break
      }
    }
    if(type === 1) {
      return res
    } else return atkRes
  }

  // 计算出生位
  getBirthplace() {
    let res = []
    this.getCountBirthplace(res)
  }

  // 棋子移动 1躲；2攻击
  chessMove(type) {
    let list = type === 1 ? this.getCanMoveDot() : this.getCanAttackDot()
    let res = getMoveDot(list, type)
    return new Promise(async (resolve) => {
      if(res) {
        if(type === 2 )this.terminator = true
        await this.move(res.x, res.y)
        resolve(true)
      } else resolve(false)
    })
  }
}

// 马
class Horse extends ChessPieces {
  score = 30
  interval = 4
  constructor(f) {
    super(f, '马')
    if(birthRandom() === 1) {
      this.getBirthplace()
    } else this.getRandomBirthplace()
  }

  // 可攻击点
  getCanAttackDot() {
    let list = [...chessList, mine].filter(x => x.factions !== this.factions).map(x => x.getLoc())
    return this.getCanMoveDot().filter(x => list.indexOf(x) >= 0) || []
  }

  // 可移动点
  getCanMoveDot() {
    let hadDot = getHadDot()
    let res = []
    // 拌马腿
    let t = hadDot.indexOf((this.x-1) + txtIn + (this.y)) >= 0
    let b = hadDot.indexOf((this.x+1) + txtIn + (this.y)) >= 0
    let l = hadDot.indexOf((this.x) + txtIn + (this.y-1)) >= 0
    let r = hadDot.indexOf((this.x) + txtIn + (this.y+1)) >= 0
    if(hadDot.indexOf((this.x-2) + txtIn + (this.y-1)) < 0 && !t) res.push((this.x-2) + txtIn + (this.y-1))
    if(hadDot.indexOf((this.x-2) + txtIn + (this.y+1)) < 0 && !t) res.push((this.x-2) + txtIn + (this.y+1))
    if(hadDot.indexOf((this.x-1) + txtIn + (this.y-2)) < 0 && !l) res.push((this.x-1) + txtIn + (this.y-2))
    if(hadDot.indexOf((this.x-1) + txtIn + (this.y+2)) < 0 && !r) res.push((this.x-1) + txtIn + (this.y+2))
    if(hadDot.indexOf((this.x+1) + txtIn + (this.y-2)) < 0 && !l) res.push((this.x+1) + txtIn + (this.y-2))
    if(hadDot.indexOf((this.x+1) + txtIn + (this.y+2)) < 0 && !r) res.push((this.x+1) + txtIn + (this.y+2))
    if(hadDot.indexOf((this.x+2) + txtIn + (this.y-1)) < 0 && !b) res.push((this.x+2) + txtIn + (this.y-1))
    if(hadDot.indexOf((this.x+2) + txtIn + (this.y+1)) < 0 && !b) res.push((this.x+2) + txtIn + (this.y+1))
    return res
  }

  // 计算出生位
  getBirthplace() {
    let res = []
    let list = mine.getCanAttackDot() || []
    if(list.length > 0) {
      for(let i = 0; i < list.length; i++) {
        let x = Number(list[i].split(txtIn)[0])
        let y = Number(list[i].split(txtIn)[1])
        res.push(
          {x: x-2, y: y-1, loc: (x-2)+txtIn+(y-1)},
          {x: x-2, y: y+1, loc: (x-2)+txtIn+(y+1)},
          {x: x-1, y: y-2, loc: (x-1)+txtIn+(y-2)},
          {x: x-1, y: y+2, loc: (x-1)+txtIn+(y+2)},
          {x: x+1, y: y-2, loc: (x+1)+txtIn+(y-2)},
          {x: x+1, y: y+2, loc: (x+1)+txtIn+(y+2)},
          {x: x+2, y: y-1, loc: (x+2)+txtIn+(y-1)},
          {x: x+2, y: y+1, loc: (x+2)+txtIn+(y+1)},
        )
      }
    }
    this.getCountBirthplace(res)
  }

  // 棋子移动 1躲；2攻击
  chessMove(type) {
    let list = type === 1 ? this.getCanMoveDot() : this.getCanAttackDot()
    let res = getMoveDot(list, type)
    return new Promise(async (resolve) => {
      if(res) {
        if(type === 2 )this.terminator = true
        await this.move(res.x, res.y)
        resolve(true)
      } else resolve(false)
    })
  }
}

// 士
class Knight extends ChessPieces {
  score = 20
  interval = 2
  constructor(f, isKeep) {
    super(f, '士')
    if(isKeep) {
      this.keepBirthplace()
    } else {
      if(birthRandom() === 1) {
        this.getBirthplace()
      } else this.getRandomBirthplace()
    }
  }

  // 可攻击点
  getCanAttackDot() {
    let list = [...chessList, mine].filter(x => x.factions !== this.factions).map(x => x.getLoc())
    return this.getCanMoveDot().filter(x => list.indexOf(x) >= 0) || []
  }

  // 可移动点
  getCanMoveDot() {
    let hadDot = getHadDot()
    let res = []
    if(hadDot.indexOf((this.x-1) + txtIn + (this.y-1)) < 0) res.push((this.x-1) + txtIn + (this.y-1))
    if(hadDot.indexOf((this.x+1) + txtIn + (this.y-1)) < 0) res.push((this.x+1) + txtIn + (this.y-1))
    if(hadDot.indexOf((this.x-1) + txtIn + (this.y+1)) < 0) res.push((this.x-1) + txtIn + (this.y+1))
    if(hadDot.indexOf((this.x+1) + txtIn + (this.y+1)) < 0) res.push((this.x+1) + txtIn + (this.y+1))
    return res
  }

  // 守将
  keepBirthplace() {
    let target = chessList.find(x => x.text === '将')
    let res = [
      {x: target.x-1, y: target.y-1, loc: (target.x-1)+txtIn+(target.y-1)},
      {x: target.x+1, y: target.y-1, loc: (target.x+1)+txtIn+(target.y-1)},
      {x: target.x-1, y: target.y+1, loc: (target.x-1)+txtIn+(target.y+1)},
      {x: target.x+1, y: target.y+1, loc: (target.x+1)+txtIn+(target.y+1)},
    ]
    this.getCountBirthplace(res)
  }

  // 计算出生位
  getBirthplace() {
    let res = []
    let list = mine.getCanAttackDot() || []
    if(list.length > 0) {
      for(let i = 0; i < list.length; i++) {
        let x = Number(list[i].split(txtIn)[0])
        let y = Number(list[i].split(txtIn)[1])
        res.push(
          {x: x-1, y: y-1, loc: (x-1)+txtIn+(y-1)},
          {x: x+1, y: y+1, loc: (x+1)+txtIn+(y+1)},
          {x: x+1, y: y-1, loc: (x+1)+txtIn+(y-1)},
          {x: x-1, y: y+1, loc: (x-1)+txtIn+(y+1)},
        )
      }
    }
    this.getCountBirthplace(res)
  }

  // 棋子移动 1躲；2攻击
  chessMove(type) {
    let list = type === 1 ? this.getCanMoveDot() : this.getCanAttackDot()
    let res = getMoveDot(list, type)
    return new Promise(async (resolve) => {
      if(res) {
        if(type === 2 )this.terminator = true
        await this.move(res.x, res.y)
        resolve(true)
      } else resolve(false)
    })
  }
}

// 将
class Marshal extends ChessPieces {
  score = 100
  interval = 2
  constructor(f) {
    super(f, '将')
    this.getBirthplace()
  }

  // 可攻击点
  getCanAttackDot() {
    let list = [...chessList, mine].filter(x => x.factions !== this.factions).map(x => x.getLoc())
    return this.getCanMoveDot().filter(x => list.indexOf(x) >= 0) || []
  }

  // 可移动点
  getCanMoveDot() {
    let hadDot = getHadDot()
    let res = []
    if(hadDot.indexOf((this.x) + txtIn + (this.y-1)) < 0) res.push((this.x) + txtIn + (this.y-1))
    if(hadDot.indexOf((this.x-1) + txtIn + (this.y)) < 0) res.push((this.x-1) + txtIn + (this.y))
    if(hadDot.indexOf((this.x) + txtIn + (this.y+1)) < 0) res.push((this.x) + txtIn + (this.y+1))
    if(hadDot.indexOf((this.x+1) + txtIn + (this.y)) < 0) res.push((this.x+1) + txtIn + (this.y))
    return res
  }

  // 计算出生位
  getBirthplace() {
    let res = []
    let list = []
    chessList.forEach(item => {
      list.push(
        item.getLoc(),
        (item.x-1)+txtIn+(item.y-1),
        (item.x-1)+txtIn+(item.y+1),
        (item.x+1)+txtIn+(item.y+1),
        (item.x+1)+txtIn+(item.y-1),
      )
    })
    list = Array.from(new Set(list))
    for(let x = 0; x < 9; x++) {
      for(let y = 0; y < 10; y++) {
        if(list.indexOf(x+txtIn+y) < 0) res.push({x, y, loc: x+txtIn+y})
      }
    }
    res.sort((a, b) => { // 从中部开始
      let x1 = Math.abs(a.x - 5)
      let x2 = Math.abs(b.x - 5)
      let y1 = Math.abs(a.y - 5)
      let y2 = Math.abs(b.y - 5)
      return (x1+y1) - (x2+y2)
    })
    this.getCountBirthplace(res)
  }

  // 棋子移动 1躲；2攻击
  chessMove(type) {
    let list = type === 1 ? this.getCanMoveDot() : this.getCanAttackDot()
    let res = getMoveDot(list, type)
    return new Promise(async (resolve) => {
      if(res) {
        if(type === 2 )this.terminator = true
        await this.move(res.x, res.y)
        resolve(true)
      } else resolve(false)
    })
  }
}

// 卒
class Soldiers extends ChessPieces {
  score = 10
  interval = 1
  constructor(f) {
    super(f, '卒')
    if(birthRandom() === 1) {
      this.getBirthplace()
    } else this.getRandomBirthplace()
  }

  // 可攻击点
  getCanAttackDot() {
    let list = [...chessList, mine].filter(x => x.factions !== this.factions).map(x => x.getLoc())
    return this.getCanMoveDot().filter(x => list.indexOf(x) >= 0) || []
  }

  // 可移动点
  getCanMoveDot() {
    let hadDot = getHadDot()
    let res = []
    // if(hadDot.indexOf((this.x) + txtIn + (this.y-1)) < 0) 
    res.push((this.x) + txtIn + (this.y-1))
    // if(hadDot.indexOf((this.x-1) + txtIn + (this.y)) < 0) 
    res.push((this.x-1) + txtIn + (this.y))
    // if(hadDot.indexOf((this.x) + txtIn + (this.y+1)) < 0) 
    res.push((this.x) + txtIn + (this.y+1))
    // if(hadDot.indexOf((this.x+1) + txtIn + (this.y)) < 0) 
    res.push((this.x+1) + txtIn + (this.y))
    return res
  }

  // 计算出生位
  getBirthplace() {
    let res = []
    let list = mine.getCanAttackDot() || []
    if(list.length > 0) {
      for(let i = 0; i < list.length; i++) {
        let x = Number(list[i].split(txtIn)[0])
        let y = Number(list[i].split(txtIn)[1])
        res.push(
          {x: x-1, y: y, loc: (x-1)+txtIn+y},
          {x: x, y: y+1, loc: x+txtIn+(y+1)},
          {x: x+1, y: y, loc: (x+1)+txtIn+y},
          {x: x, y: y-1, loc: x+txtIn+(y-1)},
        )
      }
    }
    this.getCountBirthplace(res)
  }

  // 棋子移动 1躲；2攻击
  chessMove(type) {
    let list = type === 1 ? this.getCanMoveDot() : this.getCanAttackDot()
    let res = getMoveDot(list, type)
    return new Promise(async (resolve) => {
      if(res) {
        if(type === 2 )this.terminator = true
        await this.move(res.x, res.y)
        resolve(true)
      } else resolve(false)
    })
  }
}

// 绘制新棋子tag
function drawNewTag(list) {
  list.forEach(item => {
    let {x, y} = item 
    ctx.fillStyle="red";
    ctx.fillRect(padding + width * x + chessRadius * 0.5, padding + height * y - chessRadius * 0.9, 20, 11);
    ctx.strokeStyle = '#ffffff'
    ctx.font = '10px Fangsong'
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.strokeText('new', padding + width * x + chessRadius * 1, padding + height * y - chessRadius * 0.7)
  });
}

// 获取已占点位
function getHadDot() {
  return chessList.map(x => x.getLoc())
}

// 点位是否可用
function dotStatus(loc) {
  let x = Number(loc.split(txtIn)[0])
  let y = Number(loc.split(txtIn)[1])
  if(x >= 0 && x <= 8 && y >= 0 && y <= 9 && mine.getCanMoveDot().indexOf(loc) < 0 && mine.getLoc() !== loc && getHadDot().indexOf(loc) < 0) return true
  return false
}

// 获取移动点 1躲；2攻击
function getMoveDot(list, type) {
  const angles = [0, 90, 180, 270]
  let res = null
  let mineObj = {x: mine.x, y: mine.y}
  let newlist = list.map(x => {
    return {
      loc: x,
      x: Number(x.split(txtIn)[0]),
      y: Number(x.split(txtIn)[1])
    }
  }).sort((x, y) => { // 优先反方向
    return angles.indexOf(dotAngle(y, mineObj)) >= 0 ? -1 : 1
  })
  for(let i = 0; i < newlist.length; i++) {
    if(type === 1 && dotStatus(newlist[i].loc)) {
      res = {x: newlist[i].x, y: newlist[i].y}
      break
    } else if(type === 2 && newlist[i].loc === mine.getLoc()) {
      res = {x: newlist[i].x, y: newlist[i].y}
      break
    }
  }
  return res
}

// 两点距离
function dotDistance(x, y) {
  return Math.sqrt((x.x - y.x)**2 + (x.y - y.y)**2)
}

// 两点角度
function dotAngle(x, y) {
  const radians = Math.atan2(y.y - x.y, y.x - x.x)
  const degrees = Math.abs(radians * (180 / Math.PI))
  return degrees
}

// 随机出生
function birthRandom() {
  let list = [ 1, 0, 0, 0 ]
  return list[Math.floor(Math.random() * 4)]
}
