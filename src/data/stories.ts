import { Story } from '../types';

// Story A — LTK (Trang's brother) / Khu Thành Công
// Narrator: LTK. Daily route: ăn vặt cổng trường → hồ Thành Công → quán net
const TRANG: Story = {
  id: 'trang',
  narrator: 'LTK',
  title: 'Khu Thành Công',
  subtitle: 'Một ngày bình thường hồi bé của LTK',
  coverColor: '#4a3e75',
  spaces: [
    {
      id: 'cong-truong',
      label: 'Cổng trường',
      sublabel: 'Trường Tiểu học Thành Công — kem chanh, con quay, truyện Doraemon',
      bgGradient: 'linear-gradient(160deg, #f5e6c8 0%, #e8d5a3 40%, #d4b896 100%)',
      bgTone: '#c8a96e',
      bgImage: '/images/cong-truong.jpg',
      bgStreetView: 'https://www.google.com/maps/embed?pb=!4v1780819620031!6m8!1m7!1sIiZLPt3-ifENZXNWcTQdxg!2m2!1d21.02304508332172!2d105.8139626145351!3f260.49747!4f0!5f0.7820865974627469',
      clues: [
        {
          id: 'trang-an-vat',
          type: 'routine',
          label: 'Kem chanh cổng trường',
          quote: '"Tan học là chạy thẳng ra mua kem chanh — đứng ăn luôn ngoài cổng, không về nhà trước."',
          voiceNote:
            'LTK nhớ cái hàng kem chanh nhỏ trước cổng trường — loại kem đá chua ngọt bọc trong miếng giấy bóng. Hồi đó còn có hàng thuê truyện tranh Doraemon, mua con quay, yoyo. Đó là khoảng 15 phút tự do nhất trong ngày, trước khi về nhà.',
          ambient: 'wind',
          x: 28,
          y: 58,
        },
        {
          id: 'trang-tieng-trong',
          type: 'sound',
          label: 'Tiếng trống trường và không khí nóng',
          quote: '"Hồi đó lớp không có điều hòa, nên nghe được tất cả — tiếng trống, tiếng xe ngoài phố, tiếng người."',
          voiceNote:
            'Trường tiểu học Thành Công không có điều hòa. Cửa sổ luôn mở, tiếng trống báo giờ vang to khắp khu. LTK kể vì vậy mà nhớ rất rõ âm thanh của khu phố hồi bé — thứ mà bây giờ lớp học nào cũng đóng cửa bật máy lạnh, không còn nghe được nữa.',
          ambient: 'wind',
          x: 68,
          y: 42,
        },
      ],
    },
    {
      id: 'ho-thanh-cong',
      label: 'Hồ Thành Công',
      sublabel: 'Tập xe đạp, mùi tanh, nhiều chó — và hàng rào ngăn không vào được',
      bgGradient: 'linear-gradient(160deg, #c8dde8 0%, #a3c4d5 40%, #7eaabf 100%)',
      bgTone: '#5a7a8a',
      bgImage: '/images/ho-thanh-cong.jpg',
      bgStreetView: 'https://www.google.com/maps/embed?pb=!4v1780816975400!6m8!1m7!1sCAoSFkNJSE0wb2dLRUlDQWdJRFdzS0RJYVE.!2m2!1d21.01870719079754!2d105.8130115710941!3f69.82684308992756!4f-2.586612419766098!5f0.7820865974627469',
      clues: [
        {
          id: 'trang-xe-dap',
          type: 'routine',
          label: 'Tập xe đạp — và không thích',
          quote: '"Bị bắt ra hồ tập xe đạp. Mình không thích lắm — hồ tanh, nhiều chó, và có hàng rào khắp nơi khó vào."',
          voiceNote:
            'LTK không thích ra hồ Thành Công hồi nhỏ. Hồ có mùi tanh, nhiều chó lang thang, và bờ hồ bị chắn bởi hàng rào sắt gỉ khiến khó tiếp cận. Bây giờ hàng rào đã được tháo bỏ — nhưng cái ký ức về việc không thể đến gần mặt nước thì vẫn còn.',
          ambient: 'cicadas',
          x: 45,
          y: 62,
        },
        {
          id: 'trang-nhac-aerobic',
          type: 'sound',
          label: 'Tiếng nhạc aerobic chiều',
          quote: '"Buổi chiều nào cũng có nhạc aerobic vang ra từ cái loa sắt cũ ở sân — đó là dấu hiệu chiều đã về."',
          voiceNote:
            'Mỗi chiều 5 giờ, cái loa cộng đồng cạnh hồ lại bật nhạc aerobic. Các cô các bà tập đều đặn, bọn trẻ đứng nhìn. Tiếng nhạc đó vang khắp khu tập thể — ai ở đây cũng nhớ. Bây giờ không còn nghe nữa.',
          ambient: 'aerobic',
          x: 72,
          y: 38,
        },
        {
          id: 'trang-khu-tap-the',
          type: 'loss',
          label: 'Cả khu biết nhau',
          quote: '"Khu tập thể đặc biệt lắm — cả phố là một nhà, ai cũng biết tên nhau."',
          voiceNote:
            'Khu Thành Công sẽ không còn như cũ. LTK tiếc không chỉ vì những âm thanh hồi bé mà vì cả một mô hình sống — khu tập thể nơi mọi người biết nhau, sinh hoạt chỉ trong một phố nhỏ. Khi giải tỏa, không chỉ nhà mất đi — cái cách người ta sống cùng nhau cũng mất theo.',
          ambient: 'wind',
          x: 30,
          y: 35,
        },
      ],
    },
    {
      id: 'quan-net',
      label: 'Quán net',
      sublabel: 'Góc phố quen thuộc, tiếng phím lách cách',
      bgGradient: 'linear-gradient(160deg, #2a1f3d 0%, #3d2f5c 50%, #1a1228 100%)',
      bgTone: '#1a1228',
      bgImage: '/images/quan-net.jpg',
      // TEST WALK — 4 connected nodes simulating a street walk.
      // node-01: radio dish desert (Pannellum alma.jpg)
      // node-02: Paris Montmartre market street
      // node-03: Durlach market square, Germany
      // node-04: Braunschweig pedestrian street
      // Real DJI Osmo 360 shots replace this after Wednesday's shoot.
      bgTourNodes: [
        {
          id: 'node-01',
          panorama: '/tours/test/node-01.jpg',
          clueAnchors: [
            { clueId: 'trang-tieng-chui', yaw: 30,  pitch: -5 },
          ],
          navAnchors: [
            { toNodeId: 'node-02', yaw: 0, pitch: -8, label: 'Đi vào trong ngõ' },
          ],
        },
        {
          id: 'node-02',
          panorama: '/tours/test/node-02.jpg',
          clueAnchors: [
            { clueId: 'trang-choi-net', yaw: -40, pitch: 0 },
          ],
          navAnchors: [
            { toNodeId: 'node-01', yaw: 180, pitch: -8, label: 'Quay lại' },
            { toNodeId: 'node-03', yaw: 0,   pitch: -8, label: 'Tiếp tục' },
          ],
        },
        {
          id: 'node-03',
          panorama: '/tours/test/node-03.jpg',
          navAnchors: [
            { toNodeId: 'node-02', yaw: 180, pitch: -8, label: 'Quay lại' },
            { toNodeId: 'node-04', yaw: 0,   pitch: -8, label: 'Tiếp tục' },
          ],
        },
        {
          id: 'node-04',
          panorama: '/tours/test/node-04.jpg',
          navAnchors: [
            { toNodeId: 'node-03', yaw: 180, pitch: -8, label: 'Quay lại' },
          ],
        },
      ],
      clues: [
        {
          id: 'trang-tieng-chui',
          type: 'sound',
          label: 'Tiếng chửi và tiếng phím Audition',
          quote: '"Tiếng chửi nhau khi thua game, tiếng phím gõ Audition — đó là âm thanh của quán net hồi đó."',
          voiceNote:
            'LTK nhớ rất rõ: quán net mái tôn góc phố, máy tính cũ to đùng màn hình lồi, quạt trần quay ầm ĩ. Tiếng bàn phím gõ lách cách khi chơi Audition, tiếng các anh chửi nhau khi thua — đó là âm thanh của một buổi chiều tự do.',
          ambient: 'keyboard',
          x: 35,
          y: 55,
        },
        {
          id: 'trang-choi-net',
          type: 'routine',
          label: 'Tan học chỉ muốn về chơi net',
          quote: '"Tan học xong là chỉ muốn một thứ — chạy thẳng ra quán net, không về nhà trước."',
          voiceNote:
            'Không phải ngày nào cũng đi được, nhưng đủ nhiều để thành thói quen. Ngồi vào cái ghế nhựa trước màn hình CRT to đùng, bài Audition "Please Tell Me Why" vang lên — lo âu học hành tan biến. LTK kể đó là khoảng thời gian tự do nhất trong ngày.',
          ambient: 'keyboard',
          x: 62,
          y: 48,
        },
      ],
    },
  ],
  // Assembly answer: the correct 3 clue IDs for the day-route in order
  routeClueIds: ['trang-an-vat', 'trang-xe-dap', 'trang-choi-net'],
  routeSlotLabels: ['Tan học, chạy ra...', 'Ghé qua hồ...', 'Cuối ngày...'],
  cannotBeMoved: [
    'Mùi kem chanh chua ngọt đứng ăn trước cổng trường — không có ghế, không cần ghế.',
    'Tiếng trống trường vang ra qua cửa sổ mở vì lớp không có điều hòa.',
    'Tiếng nhạc aerobic chiều 5 giờ từ cái loa sắt cũ ở sân hồ.',
    'Mùi tanh của hồ và hàng rào sắt gỉ ngăn không cho lại gần mặt nước.',
    'Tiếng phím gõ Audition và tiếng chửi nhau trong quán net mái tôn — và việc không ai thực sự giận.',
    'Khu tập thể Thành Công nguyên vẹn — một phố, mọi người biết tên nhau.',
  ],
  cluesNeededToUnlock: 4,
};

// Story B — Essy / Ngõ - Giếng - Chợ tạm
// Narrator: Essy. Two identified losses: (1) kinh nghiệm navigate ngõ của người bản địa,
// (2) không gian xanh tạo ra bởi ngõ ngách và cây.
// Recording is exploratory (walk-around), not strictly chronological — puzzle is spatial not time-based.
const ESSY: Story = {
  id: 'essy',
  narrator: 'Essy',
  title: 'Ngõ – Chợ – Giếng',
  subtitle: 'Những thứ chỉ người sống ở đây mới biết — và sắp mất',
  coverColor: '#7d9b84',
  spaces: [
    {
      id: 'nha-ngo',
      label: 'Nhà / Ngõ',
      sublabel: 'Ngõ khó tìm, cây xanh chen vào ngách, và những quán cà phê khuất',
      bgGradient: 'linear-gradient(160deg, #d4c5a9 0%, #c5b08a 40%, #b09060 100%)',
      bgTone: '#6b5a3e',
      bgImage: '/images/nha-ngo-alley.jpg',
      bgStreetView: 'https://www.google.com/maps/embed?pb=!4v1780817061285!6m8!1m7!1s6dL2vzb0aYEtr1gNc0a2bw!2m2!1d21.01342417728203!2d105.8361921928282!3f51.4559087277337!4f-12.848211852718478!5f0.7820865974627469',
      clues: [
        {
          id: 'essy-ngo-kho',
          type: 'place',
          label: 'Chỉ người trong ngõ mới biết đường',
          quote: '"Mấy anh Be không bao giờ tìm được nhà mình. Phải gọi điện ít nhất một lần."',
          voiceNote:
            'Khu ngõ này có một loại kiến thức riêng — cách navigate qua những hẻm ngoặt không có tên, không có số nhà rõ ràng. Chỉ người sống ở đây mới biết đi như thế nào. Essy gọi đó là kinh nghiệm của người bản địa. Khi khu bị giải tỏa, kinh nghiệm đó cũng mất theo — không ai cần nó nữa.',
          ambient: 'wind',
          x: 40,
          y: 60,
        },
        {
          id: 'essy-cay-xanh-ngo',
          type: 'place',
          label: 'Không gian xanh trong ngõ hẹp',
          quote: '"Ngõ hẹp nhưng đâu đâu cũng có cây — cây mọc ra từ tường, từ mái, từ góc sân."',
          voiceNote:
            'Một trong hai thứ Essy xác định sẽ mất nhất: không gian xanh tạo ra bởi sự kết hợp giữa ngõ ngách và cây cối. Không phải công viên, không phải vườn — là cây mọc tự nhiên trong những khe hở của khu dân cư dày đặc. Thứ xanh đó không thể trồng lại ở chỗ khác.',
          ambient: 'wind',
          x: 25,
          y: 38,
        },
        {
          id: 'essy-ngap-mua',
          type: 'place',
          label: 'Ngập mùa mưa — khổ nhưng là nhà',
          quote: '"Vào mùa mưa, ngõ sâu hay bị ngập — nhưng đó là một phần của nhà."',
          voiceNote:
            'Mùa mưa ở Hà Nội, những ngõ sâu như ngõ này hay bị ngập. Essy nhớ nước dâng đến mắt cá chân, mấy đứa trẻ lội nước về nhà. Khổ, nhưng đó là thứ mọi người ở đây đều biết và chịu đựng cùng nhau.',
          ambient: 'kids-laughter',
          x: 65,
          y: 45,
        },
      ],
    },
    {
      id: 'cho-tam',
      label: 'Chợ tạm',
      sublabel: 'Chợ họp tự nhiên mỗi sáng — không tên, không biển hiệu',
      bgGradient: 'linear-gradient(160deg, #e8c87e 0%, #d4a84b 40%, #c08a2a 100%)',
      bgTone: '#8a6020',
      bgImage: '/images/cho-tam.jpg',
      clues: [
        {
          id: 'essy-cho-sang',
          type: 'routine',
          label: 'Chợ họp không cần ai tổ chức',
          quote: '"Chợ họp từ sáng sớm, bao nhiêu năm rồi vẫn thế — không có ai ra lệnh, tự nhiên mà thành."',
          voiceNote:
            'Essy tả chợ tạm: không có tên chính thức, không có biển hiệu, họp tự nhiên mỗi sáng từ nhiều năm nay. Người bán người mua quen nhau. Nó không phải chợ lớn — nó là trung tâm sinh hoạt của cả khu ngõ, thứ không thể copy sang chỗ mới.',
          ambient: 'wind',
          x: 50,
          y: 55,
        },
        {
          id: 'essy-tieng-cho',
          type: 'sound',
          label: 'Tiếng chợ thay đồng hồ báo thức',
          quote: '"Tiếng trả giá, tiếng rổ chén lanh canh — đó là buổi sáng. Khi chợ tan, biết là đã trưa."',
          voiceNote:
            'Không cần đặt đồng hồ. Tiếng chợ sáng là nhịp thời gian của cả khu — tiếng người, tiếng xe máy dừng, tiếng chén bát. Essy nhớ rằng khi còn ngủ cũng nghe được chợ từ trong nhà.',
          ambient: 'kids-laughter',
          x: 73,
          y: 40,
        },
      ],
    },
    {
      id: 'gieng-khu-choi',
      label: 'Giếng / Khu vui chơi',
      sublabel: 'Giếng cũ biến thành sân chơi — nơi bọn trẻ tụ tập',
      bgGradient: 'linear-gradient(160deg, #a8c5a0 0%, #7da87a 40%, #5a8a56 100%)',
      bgTone: '#3a6a36',
      bgImage: '/images/gieng-khu-choi.jpg',
      clues: [
        {
          id: 'essy-tre-con-gieng',
          type: 'sound',
          label: 'Tiếng trẻ con chơi quanh giếng',
          quote: '"Bọn trẻ chơi quanh cái giếng cả ngày — đó là trung tâm của khu."',
          voiceNote:
            'Essy kể về cái giếng cũ ở giữa khu: ban đầu là giếng thật, rồi không ai dùng nữa, rồi bọn trẻ con bắt đầu chơi quanh đó. Nó biến thành khu vui chơi không chính thức.',
          ambient: 'kids-laughter',
          x: 42,
          y: 58,
        },
        {
          id: 'essy-gieng-mat',
          type: 'loss',
          label: 'Cái giếng sẽ biến mất',
          quote: '"Khu này sắp bị giải tỏa. Cái giếng đó sẽ không còn."',
          voiceNote:
            'Essy nói nhẹ: không phải chỉ mất cái giếng, mà mất cả không gian xung quanh — nơi bọn trẻ chạy nhảy, nơi buổi chiều người lớn ngồi nói chuyện. Những thứ đó không thể ghi lại hết.',
          ambient: 'wind',
          x: 68,
          y: 35,
        },
        {
          id: 'essy-di-tich',
          type: 'place',
          label: 'Di tích gần đây sắp thành đường',
          quote: '"Khu này có ông sếp lớn nào đó, gần một di tích quốc gia — và di tích đó sắp thành mặt đường."',
          voiceNote:
            'Essy kể chi tiết làm mọi người ngạc nhiên nhất: ngay cạnh khu ngõ có một di tích quốc gia. Ít người biết. Và trong kế hoạch giải tỏa, phần đất đó sẽ trở thành mặt đường mới.',
          ambient: 'plucks',
          x: 25,
          y: 48,
        },
      ],
    },
  ],
  routeClueIds: ['essy-ngo-kho', 'essy-cho-sang', 'essy-tre-con-gieng'],
  routeSlotLabels: ['Bắt đầu từ ngõ...', 'Đi qua chợ...', 'Đến giếng...'],
  cannotBeMoved: [
    'Kinh nghiệm navigate ngõ — cái bản đồ trong đầu chỉ người sống ở đây mới có.',
    'Cây mọc trong khe tường, góc sân, mái nhà — không gian xanh không ai trồng mà tự thành.',
    'Tiếng chợ sáng vang ra từ trong ngõ — đồng hồ báo thức không cần pin.',
    'Bọn trẻ con chơi quanh cái giếng cũ không ai còn dùng — trung tâm không chính thức.',
    'Mùi bùn sau mưa lớn ngập ngõ — khổ, nhưng là mùi của nhà.',
    'Di tích quốc gia ẩn trong ngõ hẻm mà hầu hết người Hà Nội không biết là tồn tại.',
  ],
  cluesNeededToUnlock: 4,
};

// Story C — Trang / Khu Thái Thịnh
// Narrator: Trang. Daily route: học thêm → sân chơi (nhìn từ xa) → quán ốc với mẹ
// Narrative arc: archiving memory = journey of rediscovering forgotten memory
const TRANG_THAI_THINH: Story = {
  id: 'thai-thinh',
  narrator: 'Trang',
  title: 'Khu Thái Thịnh',
  subtitle: 'Những mảnh ghép tuổi thơ Trang đã quên — cho đến khi bắt đầu lưu trữ',
  coverColor: '#5a7a5a',
  spaces: [
    {
      id: 'nha-hoc-them',
      label: 'Nhà học thêm',
      sublabel: 'Khu nhà Trang học thêm để vào lớp 1',
      bgGradient: 'linear-gradient(160deg, #f0e4c8 0%, #d9c49a 40%, #c4a870 100%)',
      bgTone: '#c4a870',
      bgStreetView: 'https://www.google.com/maps/embed?pb=!4v1780820583291!6m8!1m7!1snheqPSx9wL8wlbrOwbyaPA!2m2!1d21.00703573799342!2d105.8209283929959!3f95.24497199044959!4f8.04312926871205!5f0.7820865974627469',
      clues: [
        {
          id: 'thai-thinh-hoc-them',
          type: 'routine',
          label: 'Bài học thuộc lòng trước lớp 1',
          quote: '"Mình phải học thêm trước khi vào lớp 1 — đọc, viết, đếm — trong khi bạn bè còn đang chơi."',
          voiceNote:
            'Trang nhớ lại: cái nhà học thêm nhỏ trong ngõ Thái Thịnh, cô giáo bắt đọc bảng chữ cái và đếm số mỗi buổi sáng hè. Lúc đó Trang chưa hiểu vì sao mình phải học khi mùa hè. Bây giờ mới thấy đó là một phần của tuổi thơ.',
          ambient: 'plucks',
          x: 38,
          y: 55,
        },
        {
          id: 'thai-thinh-pho-khong-xe',
          type: 'place',
          label: 'Con phố không có xe ô tô',
          quote: '"Những năm 2010, con phố này không có một chiếc xe ô tô nào đi qua cả."',
          voiceNote:
            'Trang kể: hồi đó phố Thái Thịnh yên tĩnh lạ. Xe đạp, xe máy, người đi bộ — không có ô tô. Bọn trẻ chạy giữa đường vẫn an toàn. Cái sự yên tĩnh đó bây giờ không còn nữa.',
          ambient: 'wind',
          x: 65,
          y: 42,
        },
        {
          id: 'thai-thinh-khong-duoc-choi',
          type: 'loss',
          label: 'Cảm giác không được chơi',
          quote: '"Các bạn khác được nghỉ hè — còn mình thì phải học. Hồi đó mình không vui lắm."',
          voiceNote:
            'Qua project này, Trang mới nhận ra đây là một mảnh ký ức quan trọng mà mình đã không để ý. Cái cảm giác bị bỏ lỡ tuổi thơ — dù chỉ một mùa hè — vẫn còn đọng lại đâu đó.',
          ambient: 'wind',
          x: 28,
          y: 35,
        },
      ],
    },
    {
      id: 'san-choi-tap-the',
      label: 'Sân chơi khu tập thể',
      sublabel: 'Chỗ bạn bè chơi — còn Trang phải đi học thêm',
      bgGradient: 'linear-gradient(160deg, #b8d4b0 0%, #8aba88 40%, #6a9866 100%)',
      bgTone: '#6a9866',
      bgStreetView: 'https://www.google.com/maps/embed?pb=!4v1780820391133!6m8!1m7!1sCAoSFENJSE0wb2dLRUlDQWdJRHFoWWNy!2m2!1d21.00737043585037!2d105.8205676505939!3f24.670416281318587!4f-21.52419316897445!5f0.7820865974627469',
      clues: [
        {
          id: 'thai-thinh-san-choi',
          type: 'place',
          label: 'Sân chơi dưới sân tập thể',
          quote: '"Cái sân chơi đó nằm ngay giữa khu — tôi nhìn thấy nhưng không được vào chơi."',
          voiceNote:
            'Trang kể: sân chơi khu tập thể Thái Thịnh có cầu trượt và xích đu cũ. Buổi sáng hè, bạn bè ùa xuống chơi còn Trang phải đi học thêm. Trang hay đi qua nhìn vào nhưng không dám dừng lại.',
          ambient: 'kids-laughter',
          x: 50,
          y: 58,
        },
        {
          id: 'thai-thinh-tieng-cuoi',
          type: 'sound',
          label: 'Tiếng cười từ sân chơi',
          quote: '"Tiếng bạn bè cười đùa vang lên từ dưới sân — mình nghe thấy khi đi học qua."',
          voiceNote:
            'Âm thanh đó — tiếng trẻ con chơi trong sân tập thể mùa hè — là thứ Trang đã quên mất cho đến khi bắt đầu dự án này. Lưu trữ ký ức đôi khi là cách nhặt lại những thứ tưởng đã không còn quan trọng.',
          ambient: 'kids-laughter',
          x: 72,
          y: 40,
        },
      ],
    },
    {
      id: 'quan-oc-violin',
      label: 'Quán ốc ông violin',
      sublabel: 'Ngõ 41 Thái Hà — ăn ốc, nghe violin, đi với mẹ',
      bgGradient: 'linear-gradient(160deg, #e8c890 0%, #d4a060 40%, #b87840 100%)',
      bgTone: '#c48040',
      bgStreetView: 'https://www.google.com/maps/embed?pb=!4v1780820625916!6m8!1m7!1sBlkVKUqklBllqb97pCc7CA!2m2!1d21.01136206591828!2d105.820488192404!3f132.81658590355357!4f-8.126131387858834!5f0.7820865974627469',
      clues: [
        {
          id: 'thai-thinh-vio-oc',
          type: 'sound',
          label: 'Tiếng violin trong ngõ ốc',
          quote: '"Ông chủ quán vừa mang ốc ra vừa kéo đàn — giữa cái ngõ nhỏ Thái Hà."',
          voiceNote:
            'Quán ốc nhỏ trong ngõ 41 Thái Hà — ông Vũ Văn Sỹ vừa bán vừa chơi violin cho khách nghe. Trang đi với mẹ nhiều lần. Cái hình ảnh ông bưng ốc một tay, kéo đàn một tay là thứ Trang không bao giờ quên, dù đã không nhớ ra cho đến lúc kể chuyện này.',
          ambient: 'violin',
          x: 45,
          y: 55,
        },
        {
          id: 'thai-thinh-di-voi-me',
          type: 'routine',
          label: 'Đi ăn ốc với mẹ',
          quote: '"Đây là tuổi thơ của Trang — ăn ốc ở cái ngõ nhỏ, nghe nhạc, không lo gì cả."',
          voiceNote:
            'Trang nhớ lại: những buổi tối đi ăn ốc với mẹ ở ngõ Thái Hà là khoảng thời gian yên bình nhất. Không cần đi đâu xa, chỉ cần cái ngõ quen, bát ốc nóng, và tiếng violin vọng ra. Đó là những thứ không thể mang đi khi khu phố biến mất.',
          ambient: 'violin',
          x: 65,
          y: 45,
        },
      ],
    },
  ],
  routeClueIds: ['thai-thinh-hoc-them', 'thai-thinh-san-choi', 'thai-thinh-vio-oc'],
  routeSlotLabels: ['Buổi sáng đi học thêm...', 'Ghé nhìn sân chơi...', 'Tối đi với mẹ...'],
  cannotBeMoved: [
    'Con phố Thái Thịnh năm 2010 — không một chiếc xe ô tô nào đi qua.',
    'Tiếng violin cổ điển vang ra từ ngõ 41 Thái Hà hòa với tiếng người ăn ốc.',
    'Cái sân chơi tập thể Trang nhìn thấy mỗi ngày nhưng không được vào chơi.',
    'Những mảnh ký ức tưởng không quan trọng — chỉ tìm lại được khi bắt đầu kể chuyện.',
    'Hành trình lưu trữ ký ức, thực ra, cũng là hành trình khám phá lại chính mình.',
  ],
  cluesNeededToUnlock: 4,
};

export const ALL_STORIES: Story[] = [TRANG, TRANG_THAI_THINH, ESSY];
