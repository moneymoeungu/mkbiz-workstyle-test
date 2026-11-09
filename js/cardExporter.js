/**
 * 매경비즈 결과 카드 & 두 사람 궁합 카드 고해상도 PNG 생성기
 * - 오피스 곰돌이 캐릭터 + 한글 어절 단위 자동 줄바꿈(drawWrappedKoreanText) 적용
 * - 1:1 (1080x1080) 및 9:16 (1080x1920, 상하단 250px 스토리 안전영역 확보)
 */

(function () {
  const FONT_SANS = '"Pretendard Variable", Pretendard, -apple-system, BlinkMacSystemFont, "Apple SD Gothic Neo", "Malgun Gothic", sans-serif';

  function drawCleanBox(ctx, x, y, w, h, radius, fillColor, borderColor = "#DFDBD2", lineWidth = 2) {
    ctx.fillStyle = fillColor;
    roundRectPath(ctx, x, y, w, h, radius);
    ctx.fill();

    if (lineWidth > 0 && borderColor) {
      ctx.lineWidth = lineWidth;
      ctx.strokeStyle = borderColor;
      roundRectPath(ctx, x, y, w, h, radius);
      ctx.stroke();
    }
  }

  function roundRectPath(ctx, x, y, w, h, r) {
    const radius = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.arcTo(x + w, y, x + w, y + h, radius);
    ctx.arcTo(x + w, y + h, x, y + h, radius);
    ctx.arcTo(x, y + h, x, y, radius);
    ctx.arcTo(x, y, x + w, y, radius);
    ctx.closePath();
  }

  /**
   * 한글 어절(단어) 단위로 깔끔하게 줄바꿈하여 중앙(또는 좌측) 정렬로 그리는 헬퍼
   */
  function drawWrappedKoreanText(ctx, text, cx, cy, maxWidth, lineHeight, align = "center") {
    const words = String(text || "").trim().split(/\s+/);
    const lines = [];
    let currentLine = "";

    for (let i = 0; i < words.length; i++) {
      const testLine = currentLine ? `${currentLine} ${words[i]}` : words[i];
      if (ctx.measureText(testLine).width > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = words[i];
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine) lines.push(currentLine);

    ctx.textAlign = align;
    ctx.textBaseline = "middle";
    const totalHeight = (lines.length - 1) * lineHeight;
    const startY = cy - totalHeight / 2;

    lines.forEach((line, idx) => {
      ctx.fillText(line, cx, startY + idx * lineHeight);
    });

    return lines.length;
  }

  function renderResultCardCanvas(state, ratio = "1x1") {
    const isStory = ratio === "9x16";
    const W = 1080;
    const H = isStory ? 1920 : 1080;

    const canvas = document.createElement("canvas");
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext("2d");
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    const typeCode = state.resultType || "SDLC";
    const typeInfo = window.MKBIZ_DATA.types[typeCode];
    const nickname = state.nickname || "익명";
    const avatarStyle = state.avatarStyle || "classic";
    const scores = state.axisScores || {
      tempo: { winner: typeCode[0], pct: 80 },
      decision: { winner: typeCode[1], pct: 80 },
      collab: { winner: typeCode[2], pct: 60 },
      crisis: { winner: typeCode[3], pct: 100 }
    };

    ctx.fillStyle = "#F7F5F0";
    ctx.fillRect(0, 0, W, H);

    const cardX = 56;
    const cardY = isStory ? 250 : 48;
    const cardW = W - 112;
    const cardH = isStory ? H - 500 : H - 96;

    drawCleanBox(ctx, cardX, cardY, cardW, cardH, 10, "#FFFFFF", "#1D6F42", 3);

    // 상단 엑셀 그린 타이틀 바
    ctx.fillStyle = "#1D6F42";
    ctx.fillRect(cardX, cardY, cardW, 76);

    ctx.fillStyle = "#FFFFFF";
    ctx.font = `800 24px ${FONT_SANS}`;
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText("매경비즈  |  직장인 성향 사원증 (.xlsx)", cardX + 44, cardY + 38);

    ctx.fillStyle = "#D5EBE0";
    ctx.font = `700 22px ${FONT_SANS}`;
    ctx.textAlign = "right";
    ctx.fillText(`${typeInfo.animal || ""} · ${typeInfo.name}`, cardX + cardW - 44, cardY + 38);

    if (!isStory) {
      // ================= 1:1 (1080x1080) 레이아웃 =================
      const contentTop = cardY + 112;

      ctx.fillStyle = "#5C6B61";
      ctx.font = `600 24px ${FONT_SANS}`;
      ctx.textAlign = "left";
      ctx.fillText(`${nickname}님의 직장인 성향 유형은`, cardX + 48, contentTop + 12);

      ctx.fillStyle = "#161E19";
      ctx.font = `800 50px ${FONT_SANS}`;
      ctx.fillText(typeInfo.name, cardX + 48, contentTop + 70);

      ctx.fillStyle = "#1D6F42";
      ctx.font = `700 21px ${FONT_SANS}`;
      ctx.textAlign = "right";
      ctx.fillText(`${typeInfo.animal || ""} | ${typeInfo.outfitLabel || ""}`, cardX + cardW - 48, contentTop + 72);

      // 한 줄 요약 박스 (어절 단위 자동 줄바꿈 지원)
      drawCleanBox(ctx, cardX + 48, contentTop + 114, cardW - 96, 86, 10, "#F7F5F0", "#DFDBD2", 2);
      ctx.fillStyle = "#141413";
      ctx.font = `700 24px ${FONT_SANS}`;
      drawWrappedKoreanText(ctx, `“${typeInfo.summary}”`, W / 2, contentTop + 157, cardW - 148, 34, "center");

      // 중단: 좌측 오피스 곰돌이 캐릭터 (384x384) + 우측 4축 게이지
      const midY = contentTop + 224;
      const charSize = 384;
      const charCanvas = document.createElement("canvas");
      window.MKBIZ_PIXEL.renderPixelCharacter(charCanvas, {
        typeCode,
        avatarStyle,
        frame: 0,
        size: charSize,
        showBg: true
      });

      drawCleanBox(ctx, cardX + 48, midY, charSize, charSize, 14, "#F6F3EC", "#DFDBD2", 2);
      ctx.drawImage(charCanvas, cardX + 48, midY, charSize, charSize);

      const gaugeX = cardX + 48 + charSize + 36;
      const gaugeW = cardW - (48 + charSize + 36) - 48;
      drawAxisGaugesOnCanvas(ctx, gaugeX, midY, gaugeW, charSize, scores, typeInfo.accentColor);

      // 하단 푸터
      const footerY = midY + charSize + 40;
      ctx.fillStyle = "#DFDBD2";
      ctx.fillRect(cardX + 48, footerY, cardW - 96, 2);

      ctx.fillStyle = "#6E6A63";
      ctx.font = `600 20px ${FONT_SANS}`;
      ctx.textAlign = "left";
      ctx.fillText("매경비즈 AX TF  ·  동료와 함께 보는 워크스타일 리포트", cardX + 48, footerY + 40);

      ctx.fillStyle = "#141413";
      ctx.font = `700 20px ${FONT_SANS}`;
      ctx.textAlign = "right";
      ctx.fillText("재미로 보는 결과이며 인사·평가와 무관합니다", cardX + cardW - 48, footerY + 40);
    } else {
      // ================= 9:16 (1080x1920) 스토리 레이아웃 =================
      let curY = cardY + 120;

      ctx.fillStyle = "#6E6A63";
      ctx.font = `600 28px ${FONT_SANS}`;
      ctx.textAlign = "center";
      ctx.fillText(`${nickname}님의 직장인 성향 유형은`, W / 2, curY);

      curY += 56;
      ctx.fillStyle = "#141413";
      ctx.font = `800 54px ${FONT_SANS}`;
      ctx.fillText(typeInfo.name, W / 2, curY);

      curY += 48;
      ctx.fillStyle = typeInfo.accentColor;
      ctx.font = `700 24px ${FONT_SANS}`;
      ctx.fillText(typeInfo.hashtags.join("   "), W / 2, curY);

      curY += 32;
      const charSize = 376;
      const charX = Math.floor((W - charSize) / 2);
      const charCanvas = document.createElement("canvas");
      window.MKBIZ_PIXEL.renderPixelCharacter(charCanvas, {
        typeCode,
        avatarStyle,
        frame: 0,
        size: charSize,
        showBg: true
      });
      drawCleanBox(ctx, charX, curY, charSize, charSize, 16, "#F6F3EC", "#DFDBD2", 2);
      ctx.drawImage(charCanvas, charX, curY, charSize, charSize);

      curY += charSize + 30;
      drawCleanBox(ctx, cardX + 48, curY, cardW - 96, 86, 10, "#F7F5F0", "#DFDBD2", 2);
      ctx.fillStyle = "#141413";
      ctx.font = `700 24px ${FONT_SANS}`;
      drawWrappedKoreanText(ctx, `“${typeInfo.summary}”`, W / 2, curY + 43, cardW - 148, 34, "center");

      curY += 108;
      drawAxisGaugesGrid2x2(ctx, cardX + 48, curY, cardW - 96, 184, scores, typeInfo.accentColor);

      curY += 206;
      const bestType = window.MKBIZ_DATA.types[typeInfo.bestMatch];
      const worstType = window.MKBIZ_DATA.types[typeInfo.worstMatch];
      const pairBoxW = (cardW - 96 - 24) / 2;
      const pairBoxH = 144;

      drawMiniMatchBox(ctx, cardX + 48, curY, pairBoxW, pairBoxH, "100점 찰떡 파트너", bestType, "#F1F7F4", "#1D5B47");
      drawMiniMatchBox(ctx, cardX + 48 + pairBoxW + 24, curY, pairBoxW, pairBoxH, "배울 점 많은 상극", worstType, "#FAF2F2", "#9E2A2B");

      curY += pairBoxH + 38;
      ctx.fillStyle = "#6E6A63";
      ctx.font = `600 20px ${FONT_SANS}`;
      ctx.textAlign = "center";
      ctx.fillText("매경비즈 워크스타일 리포트  ·  재미로 보는 결과이며 인사·평가에 쓰이지 않습니다", W / 2, curY);
    }

    return canvas;
  }

  function drawAxisGaugesOnCanvas(ctx, x, y, w, h, scores, accentColor) {
    drawCleanBox(ctx, x, y, w, h, 12, "#F7F5F0", "#DFDBD2", 2);
    const axes = window.MKBIZ_DATA.axes;
    const rowH = (h - 32) / 4;

    axes.forEach((axis, idx) => {
      const ry = y + 22 + idx * rowH;
      const sc = scores[axis.id] || { winner: axis.left.code, pct: 80 };
      const isLeft = sc.winner === axis.left.code;
      const winObj = isLeft ? axis.left : axis.right;

      ctx.fillStyle = "#6E6A63";
      ctx.font = `600 20px ${FONT_SANS}`;
      ctx.textAlign = "left";
      ctx.fillText(`${axis.name}`, x + 28, ry + 16);

      ctx.fillStyle = "#141413";
      ctx.font = `800 22px ${FONT_SANS}`;
      ctx.textAlign = "right";
      ctx.fillText(`${winObj.shortLabel}  ${sc.pct}%`, x + w - 28, ry + 16);

      const barX = x + 28;
      const barY = ry + 38;
      const barW = w - 56;
      const barH = 12;
      drawCleanBox(ctx, barX, barY, barW, barH, 6, "#E5E2DC", null, 0);

      const fillW = Math.max(20, Math.floor((barW * sc.pct) / 100));
      drawCleanBox(ctx, barX, barY, fillW, barH, 6, accentColor, null, 0);
    });
  }

  function drawAxisGaugesGrid2x2(ctx, x, y, w, h, scores, accentColor) {
    const axes = window.MKBIZ_DATA.axes;
    const colW = (w - 20) / 2;
    const rowH = (h - 16) / 2;

    axes.forEach((axis, idx) => {
      const col = idx % 2;
      const row = Math.floor(idx / 2);
      const bx = x + col * (colW + 20);
      const by = y + row * (rowH + 16);

      drawCleanBox(ctx, bx, by, colW, rowH, 10, "#F7F5F0", "#DFDBD2", 2);

      const sc = scores[axis.id] || { winner: axis.left.code, pct: 80 };
      const isLeft = sc.winner === axis.left.code;
      const winObj = isLeft ? axis.left : axis.right;

      ctx.fillStyle = "#6E6A63";
      ctx.font = `600 19px ${FONT_SANS}`;
      ctx.textAlign = "left";
      ctx.fillText(axis.name, bx + 20, by + 28);

      ctx.fillStyle = "#141413";
      ctx.font = `800 20px ${FONT_SANS}`;
      ctx.textAlign = "right";
      ctx.fillText(`${winObj.shortLabel} ${sc.pct}%`, bx + colW - 20, by + 28);

      const barX = bx + 20;
      const barY = by + 52;
      const barW = colW - 40;
      const barH = 10;
      drawCleanBox(ctx, barX, barY, barW, barH, 5, "#E5E2DC", null, 0);
      const fillW = Math.max(18, Math.floor((barW * sc.pct) / 100));
      drawCleanBox(ctx, barX, barY, fillW, barH, 5, accentColor, null, 0);
    });
  }

  function drawMiniMatchBox(ctx, x, y, w, h, label, targetType, bg, badgeColor) {
    drawCleanBox(ctx, x, y, w, h, 10, bg, "#DFDBD2", 2);

    const miniSize = 96;
    const miniCanvas = document.createElement("canvas");
    window.MKBIZ_PIXEL.renderPixelCharacter(miniCanvas, {
      typeCode: targetType.code,
      avatarStyle: "classic",
      frame: 0,
      size: miniSize,
      showBg: true
    });
    ctx.drawImage(miniCanvas, x + 20, y + 24, miniSize, miniSize);

    ctx.fillStyle = badgeColor;
    ctx.font = `700 19px ${FONT_SANS}`;
    ctx.textAlign = "left";
    ctx.fillText(label, x + 134, y + 48);

    ctx.fillStyle = "#141413";
    ctx.font = `800 25px ${FONT_SANS}`;
    ctx.fillText(targetType.name, x + 134, y + 86);

    ctx.fillStyle = "#6E6A63";
    ctx.font = `600 18px ${FONT_SANS}`;
    ctx.fillText(targetType.hashtags[0] || "", x + 134, y + 114);
  }

  function renderPairCardCanvas(pairData) {
    const W = 1080;
    const H = 1080;
    const canvas = document.createElement("canvas");
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext("2d");
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    ctx.fillStyle = "#F7F5F0";
    ctx.fillRect(0, 0, W, H);

    const cardX = 48;
    const cardY = 48;
    const cardW = W - 96;
    const cardH = H - 96;
    drawCleanBox(ctx, cardX, cardY, cardW, cardH, 16, "#FFFFFF", "#141413", 3);

    ctx.fillStyle = "#141413";
    ctx.fillRect(cardX, cardY, cardW, 74);

    ctx.fillStyle = "#FFFFFF";
    ctx.font = `800 24px ${FONT_SANS}`;
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText("매경비즈  |  오피스 동료 궁합 카드", cardX + 44, cardY + 37);

    ctx.fillStyle = "#D4CFC4";
    ctx.font = `700 22px ${FONT_SANS}`;
    ctx.textAlign = "right";
    ctx.fillText(`${pairData.score}점 궁합`, cardX + cardW - 44, cardY + 37);

    const charY = cardY + 108;
    const charSize = 236;

    // 사람 A
    const c1 = document.createElement("canvas");
    window.MKBIZ_PIXEL.renderPixelCharacter(c1, {
      typeCode: pairData.myType.code,
      avatarStyle: pairData.myAvatar || "classic",
      frame: 0,
      size: charSize,
      showBg: true
    });
    drawCleanBox(ctx, cardX + 80, charY, charSize, charSize, 14, "#F6F3EC", "#DFDBD2", 2);
    ctx.drawImage(c1, cardX + 80, charY, charSize, charSize);

    // 사람 B
    const c2 = document.createElement("canvas");
    window.MKBIZ_PIXEL.renderPixelCharacter(c2, {
      typeCode: pairData.partnerType.code,
      avatarStyle: "casual",
      frame: 0,
      size: charSize,
      showBg: true
    });
    drawCleanBox(ctx, cardX + cardW - 80 - charSize, charY, charSize, charSize, 14, "#F6F3EC", "#DFDBD2", 2);
    ctx.drawImage(c2, cardX + cardW - 80 - charSize, charY, charSize, charSize);

    // 중앙 점수 배지
    drawCleanBox(ctx, W / 2 - 110, charY + 50, 220, 136, 12, "#F7F5F0", "#141413", 2);
    ctx.fillStyle = "#D94814";
    ctx.font = `800 54px ${FONT_SANS}`;
    ctx.textAlign = "center";
    ctx.fillText(`${pairData.score}점`, W / 2, charY + 102);

    ctx.fillStyle = "#141413";
    ctx.font = `700 21px ${FONT_SANS}`;
    ctx.fillText(pairData.gradeInfo.badge.split("·")[1].trim(), W / 2, charY + 150);

    // 두 사람 이름 & 유형명
    const labelY = charY + charSize + 40;
    ctx.fillStyle = "#6E6A63";
    ctx.font = `600 22px ${FONT_SANS}`;
    ctx.textAlign = "center";
    ctx.fillText(`${pairData.myName}님`, cardX + 80 + charSize / 2, labelY);
    ctx.fillStyle = "#141413";
    ctx.font = `800 26px ${FONT_SANS}`;
    ctx.fillText(pairData.myType.name, cardX + 80 + charSize / 2, labelY + 36);

    ctx.fillStyle = "#6E6A63";
    ctx.font = `600 22px ${FONT_SANS}`;
    ctx.fillText(`${pairData.partnerName}님`, cardX + cardW - 80 - charSize / 2, labelY);
    ctx.fillStyle = "#141413";
    ctx.font = `800 26px ${FONT_SANS}`;
    ctx.fillText(pairData.partnerType.name, cardX + cardW - 80 - charSize / 2, labelY + 36);

    // 궁합 타이틀 & 요약 박스 (한글 줄바꿈 지원)
    const sumY = labelY + 68;
    drawCleanBox(ctx, cardX + 52, sumY, cardW - 104, 124, 10, "#F7F5F0", "#DFDBD2", 2);
    ctx.fillStyle = "#141413";
    ctx.font = `800 24px ${FONT_SANS}`;
    drawWrappedKoreanText(ctx, pairData.gradeInfo.title, W / 2, sumY + 38, cardW - 156, 32, "center");

    ctx.fillStyle = "#6E6A63";
    ctx.font = `600 19.5px ${FONT_SANS}`;
    drawWrappedKoreanText(ctx, pairData.gradeInfo.summary, W / 2, sumY + 88, cardW - 156, 28, "center");

    const axisY = sumY + 146;
    const boxW = (cardW - 104 - 36) / 4;
    pairData.axisComparisons.forEach((ac, idx) => {
      const bx = cardX + 52 + idx * (boxW + 12);
      const bg = ac.isGood ? "#F1F7F4" : "#F7F5F0";
      drawCleanBox(ctx, bx, axisY, boxW, 110, 8, bg, "#DFDBD2", 2);
      ctx.fillStyle = "#6E6A63";
      ctx.font = `600 18px ${FONT_SANS}`;
      ctx.textAlign = "center";
      ctx.fillText(ac.axisName, bx + boxW / 2, axisY + 28);

      ctx.fillStyle = "#141413";
      ctx.font = `800 24px ${FONT_SANS}`;
      ctx.fillText(`${ac.myCode} × ${ac.partnerCode}`, bx + boxW / 2, axisY + 58);

      ctx.fillStyle = ac.isGood ? "#1D5B47" : "#9E2A2B";
      ctx.font = `700 18px ${FONT_SANS}`;
      ctx.fillText(ac.tagText, bx + boxW / 2, axisY + 88);
    });

    const footY = axisY + 142;
    ctx.fillStyle = "#6E6A63";
    ctx.font = `600 19px ${FONT_SANS}`;
    ctx.textAlign = "center";
    ctx.fillText("재미로 보는 결과이며 인사·평가에 쓰이지 않습니다  ·  매경비즈 AX TF", W / 2, footY);

    return canvas;
  }

  function isInAppBrowser() {
    const ua = navigator.userAgent || "";
    return /KAKAOTALK|Instagram|NAVER|Line|FBAN|FBAV/i.test(ua);
  }

  function downloadCanvasAsPng(canvas, filename, onFallbackModal) {
    const dataUrl = canvas.toDataURL("image/png");

    if (isInAppBrowser() && typeof onFallbackModal === "function") {
      onFallbackModal(dataUrl, filename);
      return;
    }

    try {
      const link = document.createElement("a");
      link.download = filename;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      if (typeof onFallbackModal === "function") {
        onFallbackModal(dataUrl, filename);
      }
    }
  }

  async function shareCardViaWebShare(canvas, filename, shareTitle, shareText, shareUrl) {
    if (!navigator.share) {
      return { shared: false, reason: "unsupported" };
    }

    try {
      const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
      if (blob && navigator.canShare) {
        const file = new File([blob], filename, { type: "image/png" });
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: shareTitle,
            text: shareText,
            url: shareUrl,
            files: [file]
          });
          return { shared: true, mode: "file_and_link" };
        }
      }
      await navigator.share({
        title: shareTitle,
        text: shareText,
        url: shareUrl
      });
      return { shared: true, mode: "link_only" };
    } catch (err) {
      if (err && err.name === "AbortError") {
        return { shared: false, reason: "aborted" };
      }
      return { shared: true, mode: "error" };
    }
  }

  window.MKBIZ_EXPORTER = {
    renderResultCardCanvas,
    renderPairCardCanvas,
    downloadCanvasAsPng,
    shareCardViaWebShare,
    isInAppBrowser
  };
})();
