/**
 * 매경비즈 16유형 '직장인 동물 캐릭터' 일러스트 엔진
 * - 레퍼런스 스타일: 굵고 깔끔한 다크브라운 라인(#352822) + 동글동글하고 통통한 전신 동물 캐릭터
 * - 16개 직장인 성향 유형마다 각기 다른 동물(호랑이, 사자, 강아지, 판다, 토끼, 사슴, 원숭이, 양,
 *   곰돌이, 고양이, 펭귄, 개구리, 꼬꼬, 여우, 아기돼지, 병아리)과 맞춤형 오피스 착장(정장, 넥타이,
 *   커리어 우먼 안경, 가디건, 블레이저, 사원증) 및 시그니처 업무 소품을 렌더링합니다.
 */

(function () {
  const OUTLINE = "#352822";

  // 16유형별 동물 종 & 오피스 코디 설정
  const TYPE_CHARACTER_CONFIG = {
    SDLC: {
      species: "tiger",
      bodyColor: "#F28B30",
      subColor: "#FFF8F0",
      earInner: "#FBCFE8",
      outfitType: "suit_tie",
      jacketColor: "#1E293B",
      tieColor: "#E11D48",
      glasses: "none",
      headwear: "spark",
      leftProp: "chart",
      rightProp: "flag"
    },
    SDLR: {
      species: "lion",
      bodyColor: "#FACC55",
      maneColor: "#C86D25",
      subColor: "#FFFDF7",
      outfitType: "double_suit",
      jacketColor: "#1E3A5F",
      tieColor: "#38BDF8",
      glasses: "gold_round",
      headwear: "none",
      leftProp: "chart",
      rightProp: "pen"
    },
    SDHC: {
      species: "puppy",
      bodyColor: "#FFFFFF",
      subColor: "#F8FAFC",
      earInner: "#FDE2E4",
      outfitType: "vest_tie",
      jacketColor: "#B45309",
      tieColor: "#F59E0B",
      glasses: "horn_rim",
      headwear: "none",
      leftProp: "clipboard",
      rightProp: "megaphone"
    },
    SDHR: {
      species: "panda",
      bodyColor: "#FFFFFF",
      subColor: "#27272A",
      outfitType: "suit_tie",
      jacketColor: "#1F2937",
      tieColor: "#0D9488",
      glasses: "career_halfrim",
      headwear: "none",
      leftProp: "chart",
      rightProp: "magnifier"
    },
    SILC: {
      species: "rabbit",
      bodyColor: "#F9CEDF",
      subColor: "#FFF5F8",
      earInner: "#F49AC2",
      outfitType: "career_blazer",
      jacketColor: "#9F1239",
      tieColor: "#FB7185",
      glasses: "career_cateye",
      headwear: "bulb",
      leftProp: "rocket_pad",
      rightProp: "flag"
    },
    SILR: {
      species: "deer",
      bodyColor: "#F3C766",
      subColor: "#FFFFFF",
      antlerColor: "#9A5B2C",
      outfitType: "career_blazer",
      jacketColor: "#2E1065",
      tieColor: "#A78BFA",
      glasses: "career_cateye",
      headwear: "none",
      leftProp: "sketchbook",
      rightProp: "pen"
    },
    SIHC: {
      species: "monkey",
      bodyColor: "#BD845A",
      subColor: "#FFFDF9",
      earInner: "#F4B6A8",
      outfitType: "vest_bowtie",
      jacketColor: "#C2410C",
      tieColor: "#FACC15",
      glasses: "none",
      headwear: "headset_mic",
      leftProp: "sketchbook",
      rightProp: "megaphone"
    },
    SIHR: {
      species: "sheep",
      bodyColor: "#FFFFFF",
      faceColor: "#FCD5B8",
      earInner: "#F9B4AB",
      outfitType: "cardigan",
      jacketColor: "#9D174D",
      tieColor: "#F472B6",
      glasses: "gold_round",
      headwear: "none",
      leftProp: "sketchbook",
      rightProp: "coffee"
    },
    MDLC: {
      species: "bear",
      bodyColor: "#A97553",
      subColor: "#FFF8F0",
      earInner: "#E6B89C",
      outfitType: "suit_tie",
      jacketColor: "#14532D",
      tieColor: "#10B981",
      glasses: "horn_rim",
      headwear: "clock",
      leftProp: "clipboard",
      rightProp: "flag"
    },
    MDLR: {
      species: "cat",
      bodyColor: "#949BA4",
      subColor: "#FFFFFF",
      earInner: "#F4B6C2",
      outfitType: "double_suit",
      jacketColor: "#1E293B",
      tieColor: "#3B82F6",
      glasses: "career_halfrim",
      headwear: "none",
      leftProp: "chart",
      rightProp: "coffee"
    },
    MDHC: {
      species: "penguin",
      bodyColor: "#85B8D8",
      subColor: "#FFFFFF",
      beakColor: "#F59E0B",
      outfitType: "suit_tie",
      jacketColor: "#064E3B",
      tieColor: "#34D399",
      glasses: "none",
      headwear: "none",
      leftProp: "clipboard",
      rightProp: "coffee"
    },
    MDHR: {
      species: "frog",
      bodyColor: "#9AD289",
      subColor: "#E8F8E2",
      outfitType: "vest_bowtie",
      jacketColor: "#312E81",
      tieColor: "#818CF8",
      glasses: "gold_round",
      headwear: "none",
      leftProp: "binder",
      rightProp: "magnifier"
    },
    MILC: {
      species: "rooster",
      bodyColor: "#FFFFFF",
      combColor: "#E14B4B",
      beakColor: "#FBBF24",
      outfitType: "suit_tie",
      jacketColor: "#1E3A8A",
      tieColor: "#D97706",
      glasses: "none",
      headwear: "spark",
      leftProp: "rocket_pad",
      rightProp: "flag"
    },
    MILR: {
      species: "fox",
      bodyColor: "#EC7D44",
      subColor: "#FFF8F0",
      earInner: "#352822",
      outfitType: "career_blazer",
      jacketColor: "#4C1D95",
      tieColor: "#C4B5FD",
      glasses: "gold_round",
      headwear: "none",
      leftProp: "binder",
      rightProp: "coffee"
    },
    MIHC: {
      species: "pig",
      bodyColor: "#F291A3",
      subColor: "#FBB6C4",
      earInner: "#E16B83",
      outfitType: "vest_bowtie",
      jacketColor: "#881337",
      tieColor: "#FB7185",
      glasses: "none",
      headwear: "heart",
      leftProp: "sketchbook",
      rightProp: "coffee"
    },
    MIHR: {
      species: "chick",
      bodyColor: "#F9DF74",
      subColor: "#FEF08A",
      beakColor: "#F59E0B",
      outfitType: "cardigan",
      jacketColor: "#115E59",
      tieColor: "#2DD4BF",
      glasses: "none",
      headwear: "headphones",
      leftProp: "sprout",
      rightProp: "coffee"
    }
  };

  function renderPixelCharacter(canvas, options = {}) {
    if (!canvas) return null;
    const typeCode = (options.typeCode || "SDLC").toUpperCase();
    const frame = options.frame === 1 ? 1 : 0;
    const showBg = options.showBg !== false;

    const typeInfo =
      (window.MKBIZ_DATA && window.MKBIZ_DATA.types && window.MKBIZ_DATA.types[typeCode]) || {
        accentColor: "#1D6F42",
        bgTint: "#F3F8F5"
      };
    const cfg = TYPE_CHARACTER_CONFIG[typeCode] || TYPE_CHARACTER_CONFIG.SDLC;

    const targetSize = options.size || canvas.width || 240;
    const logicalSize = 240;
    const renderSize = Math.max(targetSize, 240);

    if (canvas.width !== renderSize || canvas.height !== renderSize) {
      canvas.width = renderSize;
      canvas.height = renderSize;
    }

    const ctx = canvas.getContext("2d");
    // [핵심 버그 수정] 매 프레임마다 변환 행렬을 완전히 초기화하여 캐릭터가 커지거나 사라지는 현상을 원천 방지
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.save();
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.clearRect(0, 0, renderSize, renderSize);

    const scale = renderSize / logicalSize;
    ctx.scale(scale, scale);

    ctx.lineJoin = "round";
    ctx.lineCap = "round";

    // 1. 배경 (엑셀 모눈종이 시트 + 부드러운 파스텔 후광)
    if (showBg) {
      ctx.fillStyle = "#F9FBF9";
      ctx.fillRect(0, 0, 240, 240);

      // 엑셀 셀 격자 무늬
      ctx.strokeStyle = "#E4ECE7";
      ctx.lineWidth = 1;
      for (let gx = 0; gx <= 240; gx += 24) {
        ctx.beginPath();
        ctx.moveTo(gx, 0);
        ctx.lineTo(gx, 240);
        ctx.stroke();
      }
      for (let gy = 0; gy <= 240; gy += 24) {
        ctx.beginPath();
        ctx.moveTo(0, gy);
        ctx.lineTo(240, gy);
        ctx.stroke();
      }

      // 파스텔 원형 후광
      ctx.fillStyle = typeInfo.accentColor;
      ctx.globalAlpha = 0.1;
      ctx.beginPath();
      ctx.arc(120, 124, 84, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1.0;

      ctx.strokeStyle = "#FFFFFF";
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.arc(120, 124, 77, 0, Math.PI * 2);
      ctx.stroke();
    }

    // 숨쉬기 애니메이션 (위아래 살짝 통통)
    const bob = frame === 1 ? -2.2 : 0;
    const armWave = frame === 1 ? -2.5 : 0;

    ctx.save();
    ctx.translate(0, bob);

    // 2. 동물 머리 뒤 요소 (사자 갈기, 사슴 뿔, 토끼 귀 등)
    drawBackHeadFeatures(ctx, cfg);

    // 3. 통통하고 귀여운 전신 몸통 & 다리 & 양팔 (레퍼런스 이미지 비율)
    drawChubbyBodyAndSuit(ctx, cfg, typeInfo, armWave);

    // 4. 동물 얼굴 본체 & 귀 & 얼굴 무늬 & 눈/코/입
    drawAnimalHeadAndFace(ctx, cfg, typeCode);

    // 5. 직장인 안경 (커리어 우먼 캣아이, 하프림, 금테 라운드, 뿔테)
    drawOfficeGlasses(ctx, cfg.glasses);

    // 6. 머리 위/귀 장식 (헤드셋 마이크, 아이디어 전구, 노이즈캔슬링 헤드폰, 시계 등)
    drawHeadwearAndAura(ctx, cfg.headwear, typeInfo.accentColor, bob);

    // 7. 양손 직장인 소품 (차트, 기획서, 만년필, 라떼 머그컵, 확성기, 바인더 등)
    drawLeftHandProp(ctx, cfg.leftProp, typeInfo.accentColor, cfg.bodyColor, armWave);
    drawRightHandProp(ctx, cfg.rightProp, typeInfo.accentColor, cfg.bodyColor, armWave);

    ctx.restore();
    ctx.restore();
    return canvas;
  }

  /**
   * 머리 뒤에 그려지는 특징 (사자 갈기, 양 구름털 외곽, 사슴 뿔, 토끼 긴 귀 등)
   */
  function drawBackHeadFeatures(ctx, cfg) {
    ctx.strokeStyle = OUTLINE;
    ctx.lineWidth = 3.2;

    if (cfg.species === "lion") {
      // 사자: 동글동글 꽃구름 모양 갈기
      ctx.fillStyle = cfg.maneColor;
      const cx = 120;
      const cy = 92;
      const r = 56;
      const bumps = 12;
      ctx.beginPath();
      for (let i = 0; i < bumps; i++) {
        const a1 = (i / bumps) * Math.PI * 2;
        const a2 = ((i + 0.5) / bumps) * Math.PI * 2;
        const a3 = ((i + 1) / bumps) * Math.PI * 2;
        const x1 = cx + Math.cos(a1) * (r - 5);
        const y1 = cy + Math.sin(a1) * (r - 5);
        const xm = cx + Math.cos(a2) * (r + 9);
        const ym = cy + Math.sin(a2) * (r + 9);
        const x2 = cx + Math.cos(a3) * (r - 5);
        const y2 = cy + Math.sin(a3) * (r - 5);
        if (i === 0) ctx.moveTo(x1, y1);
        ctx.quadraticCurveTo(xm, ym, x2, y2);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else if (cfg.species === "sheep") {
      // 양: 몽글몽글 하얀 구름털 후드
      ctx.fillStyle = "#FFFFFF";
      const cx = 120;
      const cy = 94;
      const r = 55;
      const bumps = 10;
      ctx.beginPath();
      for (let i = 0; i < bumps; i++) {
        const a1 = (i / bumps) * Math.PI * 2;
        const a2 = ((i + 0.5) / bumps) * Math.PI * 2;
        const a3 = ((i + 1) / bumps) * Math.PI * 2;
        const x1 = cx + Math.cos(a1) * (r - 4);
        const y1 = cy + Math.sin(a1) * (r - 4);
        const xm = cx + Math.cos(a2) * (r + 10);
        const ym = cy + Math.sin(a2) * (r + 10);
        const x2 = cx + Math.cos(a3) * (r - 4);
        const y2 = cy + Math.sin(a3) * (r - 4);
        if (i === 0) ctx.moveTo(x1, y1);
        ctx.quadraticCurveTo(xm, ym, x2, y2);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else if (cfg.species === "rabbit") {
      // 토끼: 쫑긋한 긴 귀 2개
      drawRabbitEar(ctx, 94, 42, -0.14, cfg.bodyColor, cfg.earInner);
      drawRabbitEar(ctx, 146, 42, 0.14, cfg.bodyColor, cfg.earInner);
    } else if (cfg.species === "deer") {
      // 사슴: 귀여운 가지 뿔 + 쫑긋 귀
      ctx.fillStyle = cfg.antlerColor;
      // 왼쪽 뿔
      ctx.save();
      ctx.translate(98, 42);
      ctx.rotate(-0.18);
      drawRoundedRect(ctx, -4, -18, 8, 24, 4);
      ctx.fill();
      ctx.stroke();
      drawRoundedRect(ctx, -12, -10, 10, 6, 3);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
      // 오른쪽 뿔
      ctx.save();
      ctx.translate(142, 42);
      ctx.rotate(0.18);
      drawRoundedRect(ctx, -4, -18, 8, 24, 4);
      ctx.fill();
      ctx.stroke();
      drawRoundedRect(ctx, 2, -10, 10, 6, 3);
      ctx.fill();
      ctx.stroke();
      ctx.restore();

      // 사슴 귀
      drawPointyEar(ctx, 82, 54, -0.35, cfg.bodyColor, "#FDE68A");
      drawPointyEar(ctx, 158, 54, 0.35, cfg.bodyColor, "#FDE68A");
    } else if (cfg.species === "monkey") {
      // 원숭이: 양옆의 큰 동그란 귀
      drawRoundEar(ctx, 64, 92, 18, cfg.bodyColor, cfg.earInner);
      drawRoundEar(ctx, 176, 92, 18, cfg.bodyColor, cfg.earInner);
    } else if (cfg.species === "bear" || cfg.species === "panda" || cfg.species === "tiger") {
      const earColor = cfg.species === "panda" ? cfg.subColor : cfg.bodyColor;
      const inner = cfg.species === "panda" ? "#52525B" : cfg.earInner || "#FDE68A";
      drawRoundEar(ctx, 82, 52, 16, earColor, inner);
      drawRoundEar(ctx, 158, 52, 16, earColor, inner);
    } else if (cfg.species === "cat" || cfg.species === "fox") {
      drawTriangleEar(ctx, 84, 52, -0.2, cfg.bodyColor, cfg.earInner);
      drawTriangleEar(ctx, 156, 52, 0.2, cfg.bodyColor, cfg.earInner);
    } else if (cfg.species === "puppy") {
      // 강아지: 옆으로 살짝 접힌 귀여운 귀
      drawFloppyPuppyEar(ctx, 72, 58, -1, cfg.bodyColor);
      drawFloppyPuppyEar(ctx, 168, 58, 1, cfg.bodyColor);
    } else if (cfg.species === "pig") {
      drawTriangleEar(ctx, 84, 54, -0.35, cfg.bodyColor, cfg.earInner);
      drawTriangleEar(ctx, 156, 54, 0.35, cfg.bodyColor, cfg.earInner);
    } else if (cfg.species === "rooster") {
      // 수탉 빨간 벼슬
      ctx.fillStyle = cfg.combColor;
      ctx.beginPath();
      ctx.arc(112, 44, 8, 0, Math.PI * 2);
      ctx.arc(120, 40, 10, 0, Math.PI * 2);
      ctx.arc(128, 44, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
  }

  function drawRoundEar(ctx, x, y, r, fill, innerFill) {
    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = fill;
    ctx.strokeStyle = OUTLINE;
    ctx.lineWidth = 3.2;
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    if (innerFill) {
      ctx.fillStyle = innerFill;
      ctx.beginPath();
      ctx.arc(0, 1, r * 0.52, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  function drawRabbitEar(ctx, x, y, angle, fill, innerFill) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.fillStyle = fill;
    ctx.strokeStyle = OUTLINE;
    ctx.lineWidth = 3.2;
    ctx.beginPath();
    ctx.ellipse(0, 0, 13, 28, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = innerFill;
    ctx.beginPath();
    ctx.ellipse(0, 2, 6.5, 18, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawTriangleEar(ctx, x, y, angle, fill, innerFill) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.fillStyle = fill;
    ctx.strokeStyle = OUTLINE;
    ctx.lineWidth = 3.2;
    ctx.beginPath();
    ctx.moveTo(-16, 14);
    ctx.quadraticCurveTo(0, -20, 16, 14);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    if (innerFill) {
      ctx.fillStyle = innerFill;
      ctx.beginPath();
      ctx.moveTo(-8, 10);
      ctx.quadraticCurveTo(0, -8, 8, 10);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  }

  function drawPointyEar(ctx, x, y, angle, fill, innerFill) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.fillStyle = fill;
    ctx.strokeStyle = OUTLINE;
    ctx.lineWidth = 3.0;
    ctx.beginPath();
    ctx.ellipse(0, 0, 14, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = innerFill;
    ctx.beginPath();
    ctx.ellipse(0, 0, 8, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawFloppyPuppyEar(ctx, x, y, dir, fill) {
    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = fill;
    ctx.strokeStyle = OUTLINE;
    ctx.lineWidth = 3.2;
    ctx.beginPath();
    ctx.moveTo(0, -6);
    ctx.quadraticCurveTo(dir * 26, -14, dir * 28, 10);
    ctx.quadraticCurveTo(dir * 22, 24, dir * 4, 14);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  /**
   * 레퍼런스 동물 캐릭터처럼 통통하고 짧은 팔다리를 가진 몸통 + 오피스 정장/블레이저/조끼/넥타이/사원증
   */
  function drawChubbyBodyAndSuit(ctx, cfg, typeInfo, armWave) {
    ctx.strokeStyle = OUTLINE;
    ctx.lineWidth = 3.2;

    // 1) 귀여운 짧은 두 다리 (하단)
    const legColor = cfg.species === "sheep" ? cfg.faceColor : cfg.bodyColor;
    ctx.fillStyle = legColor;
    drawRoundedRect(ctx, 94, 198, 18, 26, 9);
    ctx.fill();
    ctx.stroke();
    drawRoundedRect(ctx, 128, 198, 18, 26, 9);
    ctx.fill();
    ctx.stroke();

    // 정장 구두 포인트
    ctx.fillStyle = "#27272A";
    drawRoundedRect(ctx, 93, 214, 20, 10, 5);
    ctx.fill();
    ctx.stroke();
    drawRoundedRect(ctx, 127, 214, 20, 10, 5);
    ctx.fill();
    ctx.stroke();

    // 2) 양옆으로 벌린 귀여운 짧은 팔 (자켓 소매 색)
    ctx.fillStyle = cfg.jacketColor;
    // 왼팔
    ctx.save();
    ctx.translate(72, 154 + armWave * 0.4);
    ctx.rotate(0.25);
    drawRoundedRect(ctx, -22, -10, 28, 20, 10);
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // 오른팔
    ctx.save();
    ctx.translate(168, 154 - armWave * 0.4);
    ctx.rotate(-0.25);
    drawRoundedRect(ctx, -6, -10, 28, 20, 10);
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // 3) 통통한 메인 몸통 (오피스 수트/재킷/가디건/조끼)
    ctx.fillStyle = cfg.jacketColor;
    drawRoundedRect(ctx, 72, 128, 96, 82, 34);
    ctx.fill();
    ctx.stroke();

    // 4) 화이트 셔츠 브이존
    ctx.fillStyle = "#FFFFFF";
    ctx.beginPath();
    ctx.moveTo(100, 130);
    ctx.lineTo(120, 174);
    ctx.lineTo(140, 130);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // 5) 오피스 의상별 디테일 (넥타이 / 보타이 / 가디건 단추 / 더블수트 단추)
    if (cfg.outfitType === "suit_tie" || cfg.outfitType === "double_suit" || cfg.outfitType === "vest_tie") {
      // 클래식 직장인 넥타이
      ctx.fillStyle = cfg.tieColor;
      ctx.beginPath();
      ctx.moveTo(116, 136);
      ctx.lineTo(124, 136);
      ctx.lineTo(126, 166);
      ctx.lineTo(120, 174);
      ctx.lineTo(114, 166);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // 재킷 라펠
      ctx.beginPath();
      ctx.moveTo(96, 134);
      ctx.lineTo(111, 168);
      ctx.moveTo(144, 134);
      ctx.lineTo(129, 168);
      ctx.stroke();

      if (cfg.outfitType === "double_suit") {
        // 더블브레스트 금장 단추 4개
        ctx.fillStyle = "#FBBF24";
        [178, 192].forEach((by) => {
          ctx.beginPath();
          ctx.arc(108, by, 3, 0, Math.PI * 2);
          ctx.arc(132, by, 3, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
        });
      }
    } else if (cfg.outfitType === "career_blazer") {
      // 커리어 우먼 스카프/리본 타이 & 슬림 라펠
      ctx.fillStyle = cfg.tieColor;
      ctx.beginPath();
      ctx.moveTo(120, 144);
      ctx.lineTo(109, 138);
      ctx.lineTo(112, 150);
      ctx.closePath();
      ctx.moveTo(120, 144);
      ctx.lineTo(131, 138);
      ctx.lineTo(128, 150);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(120, 144, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // 골드 브로치 핀
      ctx.fillStyle = "#FACC15";
      ctx.beginPath();
      ctx.arc(140, 154, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    } else if (cfg.outfitType === "vest_bowtie") {
      // 귀여운 나비넥타이(보타이)
      ctx.fillStyle = cfg.tieColor;
      ctx.beginPath();
      ctx.moveTo(120, 142);
      ctx.lineTo(108, 135);
      ctx.lineTo(108, 149);
      ctx.closePath();
      ctx.moveTo(120, 142);
      ctx.lineTo(132, 135);
      ctx.lineTo(132, 149);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(120, 142, 3.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    } else if (cfg.outfitType === "cardigan") {
      // 가디건 + 미니 타이 + 우드 단추
      ctx.fillStyle = cfg.tieColor;
      ctx.beginPath();
      ctx.moveTo(117, 136);
      ctx.lineTo(123, 136);
      ctx.lineTo(124, 160);
      ctx.lineTo(120, 166);
      ctx.lineTo(116, 160);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = "#F59E0B";
      [178, 192].forEach((by) => {
        ctx.beginPath();
        ctx.arc(120, by, 3.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      });
    }

    // 6) 매경비즈 사원증 목걸이 & 미니 사원증 배지
    ctx.strokeStyle = typeInfo.accentColor;
    ctx.lineWidth = 2.6;
    ctx.beginPath();
    ctx.moveTo(102, 136);
    ctx.lineTo(115, 174);
    ctx.moveTo(138, 136);
    ctx.lineTo(125, 174);
    ctx.stroke();

    ctx.fillStyle = "#FFFFFF";
    ctx.strokeStyle = OUTLINE;
    ctx.lineWidth = 2.2;
    drawRoundedRect(ctx, 108, 172, 24, 28, 4);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = typeInfo.accentColor;
    ctx.fillRect(110, 174, 20, 6);
    ctx.fillStyle = "#94A3B8";
    ctx.fillRect(113, 185, 14, 2.5);
    ctx.fillRect(113, 191, 10, 2.5);
  }

  /**
   * 16종 동물별 얼굴 형태, 무늬, 눈·코·입 렌더링
   */
  function drawAnimalHeadAndFace(ctx, cfg) {
    ctx.strokeStyle = OUTLINE;
    ctx.lineWidth = 3.2;

    // 기본 동글동글 납작 타원형 머리 (레퍼런스 동물 캐릭터 비율)
    const headFill = cfg.species === "sheep" ? cfg.faceColor : cfg.bodyColor;
    ctx.fillStyle = headFill;

    if (cfg.species === "frog") {
      // 개구리: 눈이 위로 볼록 올라온 귀여운 머리
      ctx.beginPath();
      ctx.arc(96, 56, 16, 0, Math.PI * 2);
      ctx.arc(144, 56, 16, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      drawRoundedRect(ctx, 68, 52, 104, 84, 42);
      ctx.fill();
      ctx.stroke();
      // 겹침선 지우기
      ctx.fillStyle = headFill;
      ctx.beginPath();
      ctx.arc(96, 58, 14, 0, Math.PI * 2);
      ctx.arc(144, 58, 14, 0, Math.PI * 2);
      ctx.fill();
    } else {
      drawRoundedRect(ctx, 68, 48, 104, 88, 44);
      ctx.fill();
      ctx.stroke();
    }

    // 동물별 얼굴 안쪽 무늬 (호랑이 줄무늬, 원숭이/사슴/펭귄 하얀 얼굴 마스크, 판다 눈 패치 등)
    if (cfg.species === "tiger") {
      // 호랑이 검은 줄무늬 (이마 3줄 + 양볼 2줄씩)
      ctx.fillStyle = OUTLINE;
      drawRoundedRect(ctx, 111, 50, 4, 14, 2);
      ctx.fill();
      drawRoundedRect(ctx, 118, 50, 4, 17, 2);
      ctx.fill();
      drawRoundedRect(ctx, 125, 50, 4, 14, 2);
      ctx.fill();
      // 양볼 줄무늬
      ctx.fillRect(69, 84, 11, 4);
      ctx.fillRect(69, 94, 9, 4);
      ctx.fillRect(160, 84, 11, 4);
      ctx.fillRect(162, 94, 9, 4);
    } else if (cfg.species === "monkey" || cfg.species === "deer" || cfg.species === "penguin") {
      // 하얀 안쪽 얼굴 패치
      ctx.fillStyle = "#FFFFFF";
      ctx.beginPath();
      ctx.ellipse(120, 96, 40, 32, 0, 0, Math.PI * 2);
      ctx.fill();
    } else if (cfg.species === "fox") {
      // 여우 양볼 크림색 털
      ctx.fillStyle = cfg.subColor;
      ctx.beginPath();
      ctx.ellipse(92, 110, 22, 16, -0.15, 0, Math.PI * 2);
      ctx.ellipse(148, 110, 22, 16, 0.15, 0, Math.PI * 2);
      ctx.fill();
    } else if (cfg.species === "panda") {
      // 판다 까만 눈 패치
      ctx.fillStyle = "#27272A";
      ctx.beginPath();
      ctx.ellipse(98, 92, 13, 10, -0.2, 0, Math.PI * 2);
      ctx.ellipse(142, 92, 13, 10, 0.2, 0, Math.PI * 2);
      ctx.fill();
    } else if (cfg.species === "sheep") {
      // 양 이마 위 몽글몽글 앞머리 털
      ctx.fillStyle = "#FFFFFF";
      ctx.strokeStyle = OUTLINE;
      ctx.lineWidth = 3.0;
      ctx.beginPath();
      ctx.arc(98, 56, 14, 0, Math.PI);
      ctx.arc(120, 58, 15, 0, Math.PI);
      ctx.arc(142, 56, 14, 0, Math.PI);
      ctx.fill();
      ctx.stroke();
    }

    // 발그레한 볼터치
    ctx.fillStyle = "#FB7185";
    ctx.globalAlpha = 0.35;
    ctx.beginPath();
    ctx.ellipse(86, 102, 8.5, 5.5, 0, 0, Math.PI * 2);
    ctx.ellipse(154, 102, 8.5, 5.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1.0;

    // 눈 그리기 (개구리는 위쪽 눈알, 나머지는 중앙 콩알 눈)
    if (cfg.species === "frog") {
      ctx.fillStyle = OUTLINE;
      ctx.beginPath();
      ctx.arc(96, 56, 4.5, 0, Math.PI * 2);
      ctx.arc(144, 56, 4.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#FFFFFF";
      ctx.beginPath();
      ctx.arc(97.5, 54.5, 1.6, 0, Math.PI * 2);
      ctx.arc(145.5, 54.5, 1.6, 0, Math.PI * 2);
      ctx.fill();
      // 개구리 귀여운 미소
      ctx.strokeStyle = OUTLINE;
      ctx.lineWidth = 2.8;
      ctx.beginPath();
      ctx.arc(120, 62, 8, 0.15 * Math.PI, 0.85 * Math.PI);
      ctx.stroke();
      return;
    }

    // 까만 콩알 눈
    ctx.fillStyle = cfg.species === "panda" ? "#FFFFFF" : OUTLINE;
    if (cfg.species === "panda") {
      // 판다는 패치 안에 까만 눈 + 흰 테두리 하이라이트
      ctx.fillStyle = "#18181B";
      ctx.beginPath();
      ctx.arc(99, 91, 4.8, 0, Math.PI * 2);
      ctx.arc(141, 91, 4.8, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.beginPath();
      ctx.arc(99, 90, 5.0, 0, Math.PI * 2);
      ctx.arc(141, 90, 5.0, 0, Math.PI * 2);
      ctx.fill();
    }

    // 눈 반짝이 하이라이트
    ctx.fillStyle = "#FFFFFF";
    ctx.beginPath();
    ctx.arc(100.6, 88.4, 1.9, 0, Math.PI * 2);
    ctx.arc(142.6, 88.4, 1.9, 0, Math.PI * 2);
    ctx.fill();

    // 코 & 입 (부리형 vs 돼지코형 vs 포유류 주둥이형)
    if (cfg.species === "penguin" || cfg.species === "rooster" || cfg.species === "chick") {
      // 귀여운 노란/주황 부리
      ctx.fillStyle = cfg.beakColor || "#F59E0B";
      ctx.strokeStyle = OUTLINE;
      ctx.lineWidth = 2.4;
      drawRoundedRect(ctx, 111, 92, 18, 11, 5.5);
      ctx.fill();
      ctx.stroke();
    } else if (cfg.species === "pig") {
      // 아기돼지 분홍 코
      ctx.fillStyle = cfg.subColor;
      ctx.strokeStyle = OUTLINE;
      ctx.lineWidth = 2.6;
      ctx.beginPath();
      ctx.ellipse(120, 97, 13, 9.5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = OUTLINE;
      ctx.beginPath();
      ctx.arc(116, 97, 2.2, 0, Math.PI * 2);
      ctx.arc(124, 97, 2.2, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // 호랑이/사자/강아지/고양이/곰/토끼/사슴/양/여우 주둥이 & 코
      if (["tiger", "lion", "bear", "cat", "fox"].includes(cfg.species)) {
        ctx.fillStyle = "#FFFFFF";
        ctx.beginPath();
        ctx.ellipse(120, 100, 14, 10.5, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      // 작은 코
      ctx.fillStyle = cfg.species === "rabbit" ? "#EC4899" : OUTLINE;
      ctx.beginPath();
      ctx.ellipse(120, 95, 4.5, 3.2, 0, 0, Math.PI * 2);
      ctx.fill();

      // 귀여운 스마일 입매
      ctx.strokeStyle = OUTLINE;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(114, 101);
      ctx.quadraticCurveTo(120, 107, 126, 101);
      ctx.stroke();
    }
  }

  /**
   * 직장인 안경 4종 (커리어 우먼 캣아이, 프로페셔널 하프림, 금테 라운드, 클래식 뿔테)
   */
  function drawOfficeGlasses(ctx, glassesType) {
    if (!glassesType || glassesType === "none") return;

    ctx.save();
    if (glassesType === "career_cateye") {
      // 세련된 커리어 우먼 캣아이 안경
      ctx.strokeStyle = "#881337";
      ctx.fillStyle = "rgba(255, 255, 255, 0.25)";
      ctx.lineWidth = 2.8;

      // 왼쪽 렌즈
      ctx.beginPath();
      ctx.moveTo(80, 82);
      ctx.lineTo(112, 85);
      ctx.quadraticCurveTo(111, 101, 96, 101);
      ctx.quadraticCurveTo(81, 100, 80, 82);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // 오른쪽 렌즈
      ctx.beginPath();
      ctx.moveTo(160, 82);
      ctx.lineTo(128, 85);
      ctx.quadraticCurveTo(129, 101, 144, 101);
      ctx.quadraticCurveTo(159, 100, 160, 82);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // 브릿지
      ctx.beginPath();
      ctx.moveTo(112, 88);
      ctx.lineTo(128, 88);
      ctx.stroke();
    } else if (glassesType === "career_halfrim") {
      // 지적인 커리어 하프림(반무테) 안경
      ctx.fillStyle = "rgba(224, 242, 254, 0.25)";
      ctx.strokeStyle = "#1E293B";
      ctx.lineWidth = 2.4;
      drawRoundedRect(ctx, 83, 81, 30, 19, 5);
      ctx.fill();
      ctx.stroke();
      drawRoundedRect(ctx, 127, 81, 30, 19, 5);
      ctx.fill();
      ctx.stroke();

      // 상단 굵은 눈썹테 강조
      ctx.lineWidth = 4.2;
      ctx.beginPath();
      ctx.moveTo(82, 82);
      ctx.lineTo(114, 82);
      ctx.moveTo(126, 82);
      ctx.lineTo(158, 82);
      ctx.stroke();

      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.moveTo(113, 88);
      ctx.lineTo(127, 88);
      ctx.stroke();
    } else if (glassesType === "gold_round") {
      // 스마트한 골드/브라운 라운드 안경
      ctx.strokeStyle = "#92400E";
      ctx.fillStyle = "rgba(254, 243, 199, 0.2)";
      ctx.lineWidth = 2.6;
      ctx.beginPath();
      ctx.arc(98, 90, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(142, 90, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(112, 89);
      ctx.lineTo(128, 89);
      ctx.stroke();
    } else if (glassesType === "horn_rim") {
      // 클래식 뿔테 안경
      ctx.strokeStyle = "#18181B";
      ctx.fillStyle = "rgba(241, 245, 249, 0.22)";
      ctx.lineWidth = 3.4;
      drawRoundedRect(ctx, 83, 80, 30, 20, 6);
      ctx.fill();
      ctx.stroke();
      drawRoundedRect(ctx, 127, 80, 30, 20, 6);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(113, 89);
      ctx.lineTo(127, 89);
      ctx.stroke();
    }
    ctx.restore();
  }

  /**
   * 머리 주변 오피스 아이콘 및 헤드셋/헤드폰
   */
  function drawHeadwearAndAura(ctx, headwear, accentColor, bob) {
    if (!headwear || headwear === "none") return;
    ctx.save();
    ctx.strokeStyle = OUTLINE;
    ctx.lineWidth = 2.4;

    if (headwear === "bulb") {
      // 반짝이는 기획 아이디어 전구
      ctx.translate(188, 44 - bob * 0.5);
      ctx.fillStyle = "#FDE047";
      ctx.beginPath();
      ctx.arc(0, 0, 11, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#94A3B8";
      drawRoundedRect(ctx, -4, 9, 8, 5, 2);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, -15);
      ctx.lineTo(0, -20);
      ctx.moveTo(15, 0);
      ctx.lineTo(20, 0);
      ctx.moveTo(-15, 0);
      ctx.lineTo(-20, 0);
      ctx.stroke();
    } else if (headwear === "spark") {
      // 추진력 번개 배지
      ctx.translate(190, 44);
      ctx.fillStyle = "#FBBF24";
      ctx.beginPath();
      ctx.moveTo(3, -14);
      ctx.lineTo(-9, 2);
      ctx.lineTo(-1, 2);
      ctx.lineTo(-4, 15);
      ctx.lineTo(10, -2);
      ctx.lineTo(1, -2);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else if (headwear === "clock") {
      // 정시 관리 시계
      ctx.translate(188, 46);
      ctx.fillStyle = "#FFFFFF";
      ctx.beginPath();
      ctx.arc(0, 0, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, -6);
      ctx.moveTo(0, 0);
      ctx.lineTo(5, 2);
      ctx.stroke();
    } else if (headwear === "headset_mic") {
      // MC용 방송/회의 헤드셋 마이크
      ctx.fillStyle = accentColor;
      drawRoundedRect(ctx, 56, 82, 12, 24, 6);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(62, 102);
      ctx.quadraticCurveTo(74, 118, 98, 112);
      ctx.stroke();
      ctx.fillStyle = OUTLINE;
      ctx.beginPath();
      ctx.arc(100, 112, 4, 0, Math.PI * 2);
      ctx.fill();
    } else if (headwear === "headphones") {
      // 마이페이스 노이즈캔슬링 헤드폰
      ctx.strokeStyle = OUTLINE;
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.arc(120, 92, 56, Math.PI * 1.12, Math.PI * 1.88);
      ctx.stroke();
      ctx.fillStyle = accentColor;
      ctx.lineWidth = 2.4;
      drawRoundedRect(ctx, 56, 78, 14, 28, 7);
      ctx.fill();
      ctx.stroke();
      drawRoundedRect(ctx, 170, 78, 14, 28, 7);
      ctx.fill();
      ctx.stroke();
    } else if (headwear === "heart") {
      // 팀 케미 하트
      ctx.translate(188, 48);
      ctx.fillStyle = "#FB7185";
      ctx.beginPath();
      ctx.arc(-5, -3, 6, 0, Math.PI * 2);
      ctx.arc(5, -3, 6, 0, Math.PI * 2);
      ctx.moveTo(-10.5, -1);
      ctx.lineTo(0, 11);
      ctx.lineTo(10.5, -1);
      ctx.fill();
      ctx.stroke();
    }
    ctx.restore();
  }

  /**
   * 왼손(화면 좌측) 오피스 소품
   */
  function drawLeftHandProp(ctx, propType, accentColor, pawColor, armWave) {
    ctx.save();
    ctx.translate(44, 162 + armWave * 0.5);
    ctx.rotate(-0.08);
    ctx.strokeStyle = OUTLINE;
    ctx.lineWidth = 2.5;

    if (propType === "chart") {
      // 엑셀 데이터 차트 보드
      ctx.fillStyle = "#FFFFFF";
      drawRoundedRect(ctx, -20, -24, 40, 48, 6);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#1D6F42";
      ctx.fillRect(-14, -18, 28, 6);
      ctx.fillStyle = "#CBD5E1";
      ctx.fillRect(-12, 4, 6, 12);
      ctx.fillStyle = "#64748B";
      ctx.fillRect(-3, -2, 6, 18);
      ctx.fillStyle = accentColor;
      ctx.fillRect(6, -10, 6, 26);
    } else if (propType === "clipboard") {
      // 일정표/현장 체크리스트 클립보드
      ctx.fillStyle = "#D97706";
      drawRoundedRect(ctx, -20, -24, 40, 48, 6);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(-15, -16, 30, 35);
      ctx.fillStyle = "#64748B";
      drawRoundedRect(ctx, -9, -27, 18, 7, 3);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = accentColor;
      ctx.fillRect(-10, -8, 20, 3);
      ctx.fillRect(-10, 0, 16, 3);
      ctx.fillRect(-10, 8, 18, 3);
    } else if (propType === "rocket_pad") {
      // 신사업 기획안 태블릿
      ctx.fillStyle = "#1E293B";
      drawRoundedRect(ctx, -20, -24, 40, 48, 6);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(-15, -18, 30, 36);
      ctx.fillStyle = accentColor;
      ctx.beginPath();
      ctx.moveTo(0, -12);
      ctx.lineTo(9, 6);
      ctx.lineTo(-9, 6);
      ctx.closePath();
      ctx.fill();
    } else if (propType === "binder") {
      // 정밀 아카이브 파일 바인더
      ctx.fillStyle = accentColor;
      drawRoundedRect(ctx, -20, -24, 38, 48, 5);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(-12, -16, 22, 10);
      ctx.beginPath();
      ctx.arc(-1, 10, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    } else if (propType === "sprout") {
      // 데스크 반려식물 화분
      ctx.fillStyle = "#D97706";
      drawRoundedRect(ctx, -14, -4, 28, 24, 5);
      ctx.fill();
      ctx.stroke();
      ctx.strokeStyle = "#15803D";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, -4);
      ctx.lineTo(0, -18);
      ctx.stroke();
      ctx.fillStyle = "#22C55E";
      ctx.beginPath();
      ctx.ellipse(-6, -18, 7, 4, -0.4, 0, Math.PI * 2);
      ctx.ellipse(6, -18, 7, 4, 0.4, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // 크리에이티브 스케치북
      ctx.fillStyle = "#FEF3C7";
      drawRoundedRect(ctx, -20, -24, 40, 48, 6);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = accentColor;
      ctx.fillRect(10, -24, 5, 48);
    }

    // 소품을 쥐고 있는 동그란 손
    ctx.fillStyle = pawColor;
    ctx.strokeStyle = OUTLINE;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(17, 2, 8.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  /**
   * 오른손(화면 우측) 오피스 소품
   */
  function drawRightHandProp(ctx, propType, accentColor, pawColor, armWave) {
    ctx.save();
    ctx.translate(196, 164 - armWave * 0.5);
    ctx.strokeStyle = OUTLINE;
    ctx.lineWidth = 2.5;

    if (propType === "flag") {
      // 목표 달성 플래그
      ctx.beginPath();
      ctx.moveTo(-4, 26);
      ctx.lineTo(-4, -28);
      ctx.stroke();
      ctx.fillStyle = accentColor;
      ctx.beginPath();
      ctx.moveTo(-4, -28);
      ctx.lineTo(22, -17);
      ctx.lineTo(-4, -6);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else if (propType === "pen") {
      // 디렉터 만년필/포인터
      ctx.save();
      ctx.rotate(0.35);
      ctx.fillStyle = "#1E293B";
      drawRoundedRect(ctx, -4, -24, 8, 36, 4);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#FBBF24";
      ctx.beginPath();
      ctx.moveTo(-4, -24);
      ctx.lineTo(0, -34);
      ctx.lineTo(4, -24);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    } else if (propType === "megaphone") {
      // 현장 소통 확성기
      ctx.fillStyle = accentColor;
      ctx.beginPath();
      ctx.moveTo(-10, -4);
      ctx.lineTo(14, -16);
      ctx.lineTo(14, 8);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#FFFFFF";
      drawRoundedRect(ctx, -15, -7, 6, 10, 2);
      ctx.fill();
      ctx.stroke();
    } else if (propType === "magnifier") {
      // 팩트체크 돋보기
      ctx.strokeStyle = OUTLINE;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(-4, 4);
      ctx.lineTo(-12, 18);
      ctx.stroke();
      ctx.fillStyle = "#E0F2FE";
      ctx.lineWidth = 2.6;
      ctx.beginPath();
      ctx.arc(2, -8, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    } else {
      // 직장인 필수템 커피 머그컵
      ctx.fillStyle = "#FFFFFF";
      drawRoundedRect(ctx, -13, -12, 24, 28, 5);
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(11, 2, 6, -Math.PI / 2, Math.PI / 2);
      ctx.stroke();
      ctx.fillStyle = accentColor;
      ctx.fillRect(-12, -3, 22, 9);
    }

    // 오른손
    ctx.fillStyle = pawColor;
    ctx.strokeStyle = OUTLINE;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(-14, 2, 8.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }

  function drawRoundedRect(ctx, x, y, w, h, r) {
    const radius = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.arcTo(x + w, y, x + w, y + h, radius);
    ctx.arcTo(x + w, y + h, x, y + h, radius);
    ctx.arcTo(x, y + h, x, y, radius);
    ctx.arcTo(x, y, x + w, y, radius);
    ctx.closePath();
  }

  function getPixelCharacterDataURL(options = {}) {
    const offscreen = document.createElement("canvas");
    const size = options.size || 480;
    offscreen.width = size;
    offscreen.height = size;
    renderPixelCharacter(offscreen, { ...options, size });
    return offscreen.toDataURL("image/png");
  }

  window.MKBIZ_PIXEL = {
    GRID_SIZE: 240,
    renderPixelCharacter,
    getPixelCharacterDataURL
  };
})();
