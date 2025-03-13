// 棋盘

// 绘制棋盘
function drawChessboard() {
  ctx.strokeStyle = '#333333';
  ctx.lineWidth = 1; // 线条宽度

  // 边框 start
  ctx.beginPath();
  ctx.moveTo(padding, padding);
  ctx.lineTo(width * 8 + padding, padding);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(padding, padding);
  ctx.lineTo(padding, height * 9 + padding);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(width * 8 + padding, padding);
  ctx.lineTo(width * 8 + padding, height * 9 + padding);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(padding, height * 9 + padding);
  ctx.lineTo(width * 8 + padding, height * 9 + padding);
  ctx.stroke();
  // 边框 end

  // 横
  for(let i = 1; i <= 8; i++) {
    ctx.beginPath();
    ctx.moveTo(padding, padding + height * i);
    ctx.lineTo(padding + width * 8, padding + height * i);
    ctx.stroke();
  }
  // 纵
  for(let i = 1; i <= 7; i++) {
    // 上
    ctx.beginPath();
    ctx.moveTo(padding + width * i, padding);
    ctx.lineTo(padding + width * i, height * 4 + padding);
    ctx.stroke();
    // 下
    ctx.beginPath();
    ctx.moveTo(padding + width * i, height * 5 + padding);
    ctx.lineTo(padding + width * i, height * 9 + padding);
    ctx.stroke();
  }

  // 斜
  for(let i = 0; i < 2; i++) {
    if(i === 0) {
      ctx.beginPath();
      ctx.moveTo(padding + width * 3, padding);
      ctx.lineTo(padding + width * 5, height * 2 + padding);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(padding + width * 3, height * 7 + padding);
      ctx.lineTo(padding + width * 5, height * 9 + padding);
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.moveTo(padding + width * 5, padding);
      ctx.lineTo(padding + width * 3, height * 2 + padding);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(padding + width * 5, height * 7 + padding);
      ctx.lineTo(padding + width * 3, height * 9 + padding);
      ctx.stroke();
    }
  }

  // 内角
  // 上
  drawInnerAngle(1,2)
  drawInnerAngle(7,2)
  drawInnerAngle(0,3,{lt: false, lb: false, rt: true, rb: true})
  drawInnerAngle(2,3)
  drawInnerAngle(4,3)
  drawInnerAngle(6,3)
  drawInnerAngle(8,3,{lt: true, lb: true, rt: false, rb: false})
  // 下
  drawInnerAngle(1,7)
  drawInnerAngle(7,7)
  drawInnerAngle(0,6,{lt: false, lb: false, rt: true, rb: true})
  drawInnerAngle(2,6)
  drawInnerAngle(4,6)
  drawInnerAngle(6,6)
  drawInnerAngle(8,6,{lt: true, lb: true, rt: false, rb: false})

  // 文字
  ctx.font = '24px Fangsong'
  ctx.textAlign = "left";
  ctx.textBaseline = "bottom";
  ctx.strokeText('楚河', padding + width * 1.5, height * 4.7 + padding)
  ctx.strokeText('汉界', padding + width * 5.5, height * 4.7 + padding)
}

// 绘制可移动点
function drawMoveDot() {
  let color = '#36b227'
  let dots = chessList.map(x => x.getLoc())
  mine.getCanMoveDot().forEach(item => {
    let x = Number(item.split(txtIn)[0])
    let y = Number(item.split(txtIn)[1])
    let lt = x !== 0 && y !== 0
    let lb = x !== 0 && y !== 9
    let rt = x !== 8 && y !== 0
    let rb = x !== 8 && y !== 9
    if(dots.indexOf(item) < 0) {
      if(getDanger(item)) {
        color = '#b22727'
      } else color = '#36b227'
      drawInnerAngle(x, y, {lt, lb, rt, rb }, color)
    } else {
      drawAttackDot(x, y)
    }
  })
}

// 绘制攻击点
function drawAttackDot(x, y) {
  let color = 'rgba(82, 222, 72, 0.4)'
  if(getDanger(x+txtIn+y)) {
    color = 'rgba(178, 39, 39, 0.4)'
  } else color = 'rgba(82, 222, 72, 0.4)'
  ctx.strokeStyle = `rgba(255,0,0,0)`;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(padding + width * x, padding + height * y, chessRadius, 0, Math.PI * 2, false);
  ctx.fill()
  ctx.closePath();
  ctx.stroke();
}

// 绘制内角线
function drawInnerAngle(x, y, obj, color = '#333333') {
  const long = 10
  const p = 5
  if(!obj) obj = {lt: true, lb: true, rt: true, rb: true}
  ctx.strokeStyle = color;
  if(obj.lt) {
    ctx.beginPath();
    ctx.moveTo(padding + width * x - p, height * y + padding - long - p);
    ctx.lineTo(padding + width * x - p, height * y + padding - p);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(padding + width * x - long - p, height * y + padding - p);
    ctx.lineTo(padding + width * x - p, height * y + padding - p);
    ctx.stroke();
  }
  if(obj.lb) {
    ctx.beginPath();
    ctx.moveTo(padding + width * x - p, height * y + padding + long + p);
    ctx.lineTo(padding + width * x - p, height * y + padding + p);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(padding + width * x - long - p, height * y + padding + p);
    ctx.lineTo(padding + width * x - p, height * y + padding + p);
    ctx.stroke();
  }
  if(obj.rt) {
    ctx.beginPath();
    ctx.moveTo(padding + width * x + p, height * y + padding - long - p);
    ctx.lineTo(padding + width * x + p, height * y + padding - p);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(padding + width * x + long + p, height * y + padding - p);
    ctx.lineTo(padding + width * x + p, height * y + padding - p);
    ctx.stroke();
  }
  if(obj.rb) {
    ctx.beginPath();
    ctx.moveTo(padding + width * x + p, height * y + padding + long + p);
    ctx.lineTo(padding + width * x + p, height * y + padding + p);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(padding + width * x + long + p, height * y + padding + p);
    ctx.lineTo(padding + width * x + p, height * y + padding + p);
    ctx.stroke();
  }
}

// 绘制技能
function drawSkill() {
  let t = mine.x
  let b = mine.x
  let l = mine.y
  let r = mine.y
  let time = Math.max(l, 8 - mine.x, t, 9 - mine.y) * 100
  function draw() {
    ctx.strokeStyle = `rgb(${skillColor})`
    ctx.shadowColor = `rgb(${skillColor})`;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    ctx.shadowBlur = 20;
    if(t >= 0) { // 左
      ctx.beginPath();
      ctx.moveTo(padding + width * mine.x - chessRadius, padding + height * mine.y);
      ctx.lineTo(padding + width * t, padding + height * mine.y);
      ctx.stroke();
    }
    if(b < 9) { // 右
      ctx.beginPath();
      ctx.moveTo(padding + width * mine.x + chessRadius, padding + height * mine.y);
      ctx.lineTo(padding + width * b, padding + height * mine.y);
      ctx.stroke();
    }
    if(l >= 0) { // 上
      ctx.beginPath();
      ctx.moveTo(padding + width * mine.x, padding + height * mine.y - chessRadius);
      ctx.lineTo(padding + width * mine.x, padding + height * l);
      ctx.stroke();
    }
    if(r < 10) { // 下
      ctx.beginPath();
      ctx.moveTo(padding + width * mine.x, padding + height * mine.y + chessRadius);
      ctx.lineTo(padding + width * mine.x, padding + height * r);
      ctx.stroke();
    }
  }
  return new Promise((resolve) => {
    const si = setInterval(() => {
      t -= 1
      b += 1
      r += 1
      l -= 1
      draw()
    }, 50);
    setTimeout(() => {
      clearInterval(si)
      resolve()
    }, time)    
  })
}

// 是否危险点 （前15回合保护期）
function getDanger(loc) {
  let res = false
  if(bout <= 15 && chessList.some(x => x.getCanMoveDot().indexOf(loc) >= 0)) { // 前15回合保护期
    res = true
  }
  return res
}

// 显示文字 1获胜；2失败；3复活
function showTip(type = 1) {
  let obj = {
    text: '通关成功！',
    color: 'rgb(82, 222, 72)'
  }
  if(type === 2) {
    obj = {
      text: '游戏结束！',
      color: 'rgb(178, 39, 39)'
    }
  }
  if(type === 3) {
    obj = {
      text: '复活！',
      color: `rgb(${skillColor})`
    }
  }
  resultDom.innerText = obj.text
  resultDom.style.display = 'block'
  resultDom.style.color = obj.color
  if(type === 3) {
    setTimeout(() => {
      resultDom.style.display = 'none'
    }, 1000)
  } else againBtnDom.style.display = 'block'
}
