import puppeteer from 'puppeteer';

async function clickCassette(page) {
  console.log('Waiting for "Play cassette to enter" button...');
  let cassetteBtn = null;
  const start = Date.now();
  while (!cassetteBtn && (Date.now() - start < 10000)) {
    const btns = await page.$$('button');
    for (const btn of btns) {
      const text = await page.evaluate(el => el.textContent, btn);
      if (text.includes('Play cassette to enter')) {
        cassetteBtn = btn;
        break;
      }
    }
    if (!cassetteBtn) await new Promise(r => setTimeout(r, 200));
  }
  if (!cassetteBtn) {
    throw new Error('Failed to find Play cassette to enter button');
  }
  await cassetteBtn.click();
}

async function run() {
  console.log("=== STARTING AUTOMATED E2E VALIDATION ===");
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  // Hook into Audio constructor to monitor MP3 audio events
  await page.evaluateOnNewDocument(() => {
    window.audioLog = [];
    const OriginalAudio = window.Audio;
    window.Audio = function(src) {
      const audio = new OriginalAudio();
      const logEntry = { src: src || '', playing: false, plays: 0 };
      window.audioLog.push(logEntry);

      Object.defineProperty(audio, 'src', {
        get() { return this.getAttribute('src') || ''; },
        set(val) {
          logEntry.src = val;
          this.setAttribute('src', val);
        }
      });

      if (src) {
        audio.src = src;
      }

      audio.addEventListener('play', () => {
        logEntry.playing = true;
        logEntry.plays++;
      });
      audio.addEventListener('pause', () => {
        logEntry.playing = false;
      });
      return audio;
    };
  });

  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('  [BROWSER ERROR]:', msg.text());
    }
  });

  page.on('pageerror', err => {
    console.error('  [BROWSER CRITICAL PAGE ERROR]:', err.toString());
  });

  const url = 'http://localhost:3004/?calib=1&story=trang';
  console.log(`Navigating to ${url}...`);
  try {
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 15000 });
  } catch (err) {
    console.error('Failed to load page. Make sure the dev server is running on port 3004.', err.message);
    await browser.close();
    process.exit(1);
  }

  // 1. We are directly in the SpaceDossier (Play cassette to enter)
  await clickCassette(page);

  // 2. We are now in "School Gate" (cong-truong)
  console.log('Exploring "School Gate" scene...');
  await page.waitForSelector('.text-yellow-300', { visible: true });
  await new Promise(r => setTimeout(r, 2000)); // wait for audio/renders

  // Assert: Drum audio plays at the beginning
  const audioLog = await page.evaluate(() => window.audioLog);
  console.log('Current audio playback log:', audioLog);
  const drumPlaying = audioLog.some(log => log.src && log.src.includes('sound-trong-truong.mp3') && log.playing);
  if (drumPlaying) {
    console.log('✅ PASS: School drum audio is playing at the school gate!');
  } else {
    console.error('❌ FAIL: School drum audio is NOT playing at the school gate!');
  }

  // Assert: Camera direction (auto-alignment)
  const initialYaw = await page.evaluate(() => {
    const el = document.querySelector('.text-yellow-300');
    return el ? Number(el.dataset.yaw) : null;
  });
  console.log(`Initial camera yaw: ${initialYaw}°`);
  if (initialYaw !== null && Math.abs(initialYaw - 9) < 15) {
    console.log('✅ PASS: Camera aligned forward correctly (~9°)!');
  } else if (initialYaw !== null && Math.abs(initialYaw - 189) < 15) {
    console.error('❌ FAIL: Camera is flipped 180 degrees (~189°)!');
  } else {
    console.log(`⚠️ INFO: Camera yaw is ${initialYaw}°. Check alignment.`);
  }

  // 3. Go to Net Café scene via URL query param to save E2E navigation time
  console.log('Navigating directly to Net Café space via query parameter...');
  await page.goto('http://localhost:3004/?calib=1&story=trang&space=1', { waitUntil: 'networkidle2' });
  await clickCassette(page);
  await page.waitForSelector('.text-yellow-300', { visible: true });
  await new Promise(r => setTimeout(r, 1500));

  // Assert: Typing sound should NOT be playing at the beginning of Net Café
  const audioLogNet = await page.evaluate(() => window.audioLog);
  const netTypingPlaying = audioLogNet.some(log => log.src && log.src.includes('sound-net.mp3') && log.playing);
  if (!netTypingPlaying) {
    console.log('✅ PASS: Net café keyboard sound is NOT playing at start (held until 3D scan)!');
  } else {
    console.error('❌ FAIL: Net café keyboard sound is playing immediately at start!');
  }

  // Advancing to Net Café final node
  console.log('Advancing to Net Café final node (index 16) for 3D scan...');
  for (let i = 0; i < 16; i++) {
    const currentNodeId = await page.evaluate(() => document.querySelector('.text-green-300')?.textContent);
    console.log(`Net Café Step ${i}: Current Node ID is ${currentNodeId}`);

    // If we are at the blocking clue node, click the clue hotspot to collect it
    if (currentNodeId === 'qn-06') {
      console.log('Found blocking clue node qn-06. Collecting clue to unblock...');
      
      const clicked = await page.evaluate(() => {
        const card = document.querySelector('.card-glitch');
        if (card) {
          (card).click();
          return true;
        }
        return false;
      });

      if (clicked) {
        console.log('Clicked clue card. Waiting for modal...');
        await new Promise(r => setTimeout(r, 1000)); // wait for modal
        
        // Find and click "Save to notebook" button
        const modalBtns = await page.$$('button');
        let saveBtn = null;
        for (const btn of modalBtns) {
          const text = await page.evaluate(el => el.textContent, btn);
          if (text.includes('Save to notebook') || text.includes('notebook') || text.includes('Save')) {
            saveBtn = btn;
            break;
          }
        }
        if (saveBtn) {
          await saveBtn.click();
          console.log('Clue collected successfully!');
          await new Promise(r => setTimeout(r, 1000));
        } else {
          console.error('Failed to find Save to notebook button');
        }
      } else {
        console.error('Failed to click clue hotspot card');
      }
    }

    await page.keyboard.press('ArrowRight');
    await new Promise(r => setTimeout(r, 250));
  }
  await new Promise(r => setTimeout(r, 1000));

  // Trigger 3D Scan open by clicking the 3D Scan hotspot
  console.log('Clicking the 3D scan hotspot...');
  let scanHotspot = null;
  const divs = await page.$$('button');
  for (const div of divs) {
    const text = await page.evaluate(el => el.textContent, div);
    if (text.includes('View 3D Net Café') || text.includes('View 3D') || text.includes('⬡')) {
      scanHotspot = div;
      break;
    }
  }
  if (scanHotspot) {
    await scanHotspot.click();
    console.log('Waiting for 3D Scan model to load...');
    await new Promise(r => setTimeout(r, 2000));
    
    // Assert: Typing sound is now playing
    const audioLogScan = await page.evaluate(() => window.audioLog);
    const netTypingPlayingScan = audioLogScan.some(log => log.src && log.src.includes('sound-net.mp3') && log.playing);
    if (netTypingPlayingScan) {
      console.log('✅ PASS: Net café keyboard sound starts playing when 3D scan is opened!');
    } else {
      console.error('❌ FAIL: Net café keyboard sound did NOT start playing when 3D scan was opened!');
    }
  } else {
    console.error('❌ FAIL: Could not locate "View 3D Net Café" hotspot button.');
  }

  // 4. Go to Snail Stall (thai-thinh story, space index 2: quan-oc-violin)
  console.log('Navigating directly to Snail Stall space...');
  await page.goto('http://localhost:3004/?calib=1&story=thai-thinh&space=2', { waitUntil: 'networkidle2' });
  await clickCassette(page);
  await page.waitForSelector('.text-yellow-300', { visible: true });
  await new Promise(r => setTimeout(r, 1000));

  // Programmatically click "Next Node" to advance to the final node (index 4)
  console.log('Advancing to final node...');
  for (let i = 0; i < 4; i++) {
    const currentNodeId = await page.evaluate(() => document.querySelector('.text-green-300')?.textContent);
    console.log(`Step ${i}: Current Node ID is ${currentNodeId}`);
    await page.keyboard.press('ArrowRight');
    await new Promise(r => setTimeout(r, 800));
  }
  const finalNodeId = await page.evaluate(() => document.querySelector('.text-green-300')?.textContent);
  console.log(`Final Node ID is ${finalNodeId}`);

  // Assert: Video expanded immediately on final node
  const vimeoVisible = await page.evaluate(() => {
    return !!document.querySelector('iframe[src*="vimeo.com"]');
  });
  if (vimeoVisible) {
    console.log('✅ PASS: Snail Stall video automatically expands on the final node!');
  } else {
    console.error('❌ FAIL: Snail Stall video did NOT automatically expand on the final node!');
  }

  await browser.close();
  console.log("=== E2E VALIDATION COMPLETE ===");
}

run();
