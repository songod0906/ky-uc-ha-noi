import { Story } from '../types';

// Story A — Trang / Khu Thành Công
// Narrator: Trang. Daily route: ăn vặt → tập xe đạp ở hồ → chơi net
const TRANG: Story = {
  id: 'trang',
  narrator: 'Trang',
  title: 'Khu Thành Công',
  subtitle: 'Một ngày bình thường hồi bé của Trang',
  coverColor: '#4a3e75',
  spaces: [
    {
      id: 'cong-truong',
      label: 'Cổng trường',
      sublabel: 'Đồ ăn vặt trước Trường THCS Thành Công',
      bgGradient: 'linear-gradient(160deg, #f5e6c8 0%, #e8d5a3 40%, #d4b896 100%)',
      bgTone: '#c8a96e',
      bgImage: '/images/cong-truong.jpg',
      // Street View: Trường THCS Thành Công (correct panorama provided by Trang)
      bgStreetView: 'https://www.google.com/maps/embed?pb=!4v1780819620031!6m8!1m7!1sIiZLPt3-ifENZXNWcTQdxg!2m2!1d21.02304508332172!2d105.8139626145351!3f260.49747!4f0!5f0.7820865974627469',
      clues: [
        {
          id: 'trang-an-vat',
          type: 'routine',
          label: 'Ăn vặt sau giờ học',
          quote: '"Cứ tan học là mình chạy ra đây mua mấy cái bánh tráng trộn."',
          voiceNote:
            'Trang nhớ lại: cái hàng ăn vặt nhỏ xíu trước cổng trường THCS Thành Công — không có ghế ngồi, mọi người đứng ăn, đứng cười, đứng chờ nhau. Đó là khoảng 15 phút tự do nhất trong ngày.',
          ambient: 'wind',
          x: 28,
          y: 58,
        },
        {
          id: 'trang-tieng-xich-lo',
          type: 'sound',
          label: 'Tiếng xích lô cọc cạch',
          quote: '"Hồi đó còn có xích lô chạy trong khu, tiếng bánh xe trên đá thật đặc biệt."',
          voiceNote:
            'Trước cổng trường buổi chiều, tiếng xích lô đạp chậm rãi trên nền đá lát cũ, hòa cùng tiếng trẻ con ùa ra tan học. Âm thanh đó bây giờ không còn nữa.',
          ambient: 'plucks',
          x: 68,
          y: 42,
        },
      ],
    },
    {
      id: 'ho-thanh-cong',
      label: 'Hồ Thành Công',
      sublabel: 'Nơi tập xe đạp và nghe nhạc aerobic',
      bgGradient: 'linear-gradient(160deg, #c8dde8 0%, #a3c4d5 40%, #7eaabf 100%)',
      bgTone: '#5a7a8a',
      bgImage: '/images/ho-thanh-cong.jpg',
      bgStreetView: 'https://www.google.com/maps/embed?pb=!4v1780816975400!6m8!1m7!1sCAoSFkNJSE0wb2dLRUlDQWdJRFdzS0RJYVE.!2m2!1d21.01870719079754!2d105.8130115710941!3f69.82684308992756!4f-2.586612419766098!5f0.7820865974627469',
      clues: [
        {
          id: 'trang-xe-dap',
          type: 'routine',
          label: 'Tập xe đạp quanh hồ',
          quote: '"Mình học đi xe đạp ở bờ hồ này, ngã cũng ở đây mà."',
          voiceNote:
            'Bờ hồ Thành Công những chiều hè — đường quanh hồ đủ rộng để bọn trẻ con tập xe, và đủ vắng để không sợ xe máy. Trang kể mình ngã không biết bao nhiêu lần trước khi đi được.',
          ambient: 'cicadas',
          x: 45,
          y: 62,
        },
        {
          id: 'trang-nhac-aerobic',
          type: 'sound',
          label: 'Tiếng nhạc aerobic ngoài hồ',
          quote: '"Buổi chiều nào cũng có nhạc aerobic vang ra từ cái loa sắt cũ ở sân."',
          voiceNote:
            'Mỗi chiều 5 giờ, cái loa ở sân cộng đồng cạnh hồ lại vang nhạc nhảy aerobic rộn rã. Các cô các bà nhảy đều đặn, bọn trẻ trêu đùa bắt chước. Tiếng nhạc đó là dấu hiệu chiều đã về.',
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
            'Trong tương lai, khu Thành Công sẽ không còn như cũ. Trang tiếc không chỉ vì những âm thanh hồi bé mà vì cả một mô hình sống — khu tập thể nơi mọi người biết nhau, sinh hoạt cùng nhau trong một phố nhỏ — điều đó rất hiếm và sắp biến mất.',
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
      clues: [
        {
          id: 'trang-tieng-chui',
          type: 'sound',
          label: 'Tiếng chửi nhau trong quán net',
          quote: '"Chơi game thua là chửi nhau, đó là một phần của ký ức quán net rồi."',
          voiceNote:
            'Trang cười khi nhớ lại: quán net mái tôn ở góc phố, quạt trần quay ầm ĩ, mùi thuốc lá và khói màn hình. Tiếng chửi nhau của các anh chơi game, tiếng bàn phím gõ lách cách — đó là âm thanh của một buổi chiều tự do.',
          ambient: 'keyboard',
          x: 35,
          y: 55,
        },
        {
          id: 'trang-choi-net',
          type: 'routine',
          label: 'Trốn học chơi net',
          quote: '"Cứ bốn rưỡi chiều tan học là cả đám trốn học, đạp xe ra hàng net."',
          voiceNote:
            'Không phải ngày nào cũng đi, nhưng đủ nhiều để thành thói quen. Bài Audition Please Tell Me Why vang lên là biết hôm nay sẽ là buổi chiều tốt. Lo âu học hành tan biến.',
          ambient: 'keyboard',
          x: 62,
          y: 48,
        },
      ],
    },
  ],
  // Assembly answer: the correct 3 clue IDs for the day-route in order
  routeClueIds: ['trang-an-vat', 'trang-xe-dap', 'trang-choi-net'],
  routeSlotLabels: ['Vừa tan học...', 'Rồi ra hồ...', 'Cuối ngày...'],
  cannotBeMoved: [
    'Tiếng nhạc aerobic chiều của các cô bà tập cộng đồng ở sân hồ.',
    'Mùi mồ hôi và mùi bụi đá của bờ hồ khi đạp xe lần đầu tiên.',
    'Cái cảm giác cả khu phố biết tên mình — hàng xóm, cô bán hàng, bác tài xích lô.',
    'Tiếng chửi nhau trong quán net và việc không ai thực sự giận.',
    'Khu tập thể Thành Công nguyên vẹn như cũ — một phố, một thế giới.',
  ],
  cluesNeededToUnlock: 4,
};

// Story B — Essy / Ngõ - Giếng - Chợ tạm
// Narrator: Essy. Daily route: nhà/ngõ → chợ tạm → giếng/khu vui chơi
const ESSY: Story = {
  id: 'essy',
  narrator: 'Essy',
  title: 'Ngõ – Chợ – Giếng',
  subtitle: 'Ba địa điểm quen thuộc trong một khu ngõ sẽ mất',
  coverColor: '#7d9b84',
  spaces: [
    {
      id: 'nha-ngo',
      label: 'Nhà / Ngõ',
      sublabel: 'Ngõ khó tìm, ngập mưa, và những quán cà phê nhỏ',
      bgGradient: 'linear-gradient(160deg, #d4c5a9 0%, #c5b08a 40%, #b09060 100%)',
      bgTone: '#6b5a3e',
      bgImage: '/images/nha-ngo-alley.jpg',
      bgStreetView: 'https://www.google.com/maps/embed?pb=!4v1780817061285!6m8!1m7!1s6dL2vzb0aYEtr1gNc0a2bw!2m2!1d21.01342417728203!2d105.8361921928282!3f51.4559087277337!4f-12.848211852718478!5f0.7820865974627469',
      clues: [
        {
          id: 'essy-ngo-kho',
          type: 'place',
          label: 'Ngõ khó tìm đường',
          quote: '"Mấy anh Be không bao giờ tìm được nhà mình."',
          voiceNote:
            'Essy kể: khu ngõ này nổi tiếng là khó tìm đường. Xe ôm, xe công nghệ — tất cả đều phải gọi điện thêm ít nhất một lần. Đó không phải điều bất tiện, đó là tính cách của khu ngõ.',
          ambient: 'wind',
          x: 40,
          y: 60,
        },
        {
          id: 'essy-ngap-mua',
          type: 'place',
          label: 'Ngập lũ mùa mưa',
          quote: '"Vào mùa mưa, ngõ sâu hay bị ngập — nhưng đó là một phần của nhà."',
          voiceNote:
            'Mùa mưa ở Hà Nội, những ngõ sâu như ngõ này hay bị ngập. Essy nhớ hình ảnh nước dâng đến mắt cá chân, mấy đứa trẻ lội nước về nhà. Khổ nhưng vui.',
          ambient: 'kids-laughter',
          x: 65,
          y: 45,
        },
        {
          id: 'essy-quan-ca-phe',
          type: 'place',
          label: 'Quán cà phê nhỏ trong ngõ',
          quote: '"Trong này có rất nhiều quán cà phê nhỏ, tất cả đều khuất trong hẻm."',
          voiceNote:
            'Khu ngõ này có một điểm đặc biệt: rất nhiều quán cà phê nhỏ ẩn mình trong các hẻm sâu. Gần một di tích quốc gia, nhưng không ai biết. Cái di tích đó sắp thành mặt đường.',
          ambient: 'plucks',
          x: 25,
          y: 38,
        },
      ],
    },
    {
      id: 'cho-tam',
      label: 'Chợ tạm',
      sublabel: 'Chợ họp sáng, hoạt động thường ngày của cả khu',
      bgGradient: 'linear-gradient(160deg, #e8c87e 0%, #d4a84b 40%, #c08a2a 100%)',
      bgTone: '#8a6020',
      bgImage: '/images/cho-tam.jpg',
      clues: [
        {
          id: 'essy-cho-sang',
          type: 'routine',
          label: 'Hoạt động hằng ngày ở chợ',
          quote: '"Chợ họp từ sáng sớm, bao nhiêu năm rồi vẫn thế."',
          voiceNote:
            'Essy tả chợ tạm: một khu chợ nhỏ không có tên chính thức, họp tự nhiên mỗi sáng. Người bán người mua quen nhau nhiều năm. Nó không phải chợ lớn, nhưng là trung tâm sinh hoạt của cả khu ngõ.',
          ambient: 'wind',
          x: 50,
          y: 55,
        },
        {
          id: 'essy-tieng-cho',
          type: 'sound',
          label: 'Âm thanh của chợ sáng',
          quote: '"Tiếng kêu, tiếng trả giá, tiếng rổ chén lanh canh — đó là buổi sáng của khu này."',
          voiceNote:
            'Không cần đặt đồng hồ. Tiếng chợ sáng — tiếng người, tiếng xe máy đỗ, tiếng chén bát — là đồng hồ tự nhiên của cả khu ngõ. Khi chợ tan, biết là đã trưa.',
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
  routeSlotLabels: ['Từ nhà đi ra...', 'Ghé qua...', 'Rồi đến...'],
  cannotBeMoved: [
    'Cái ngõ sâu không tên trên bản đồ — chỉ người trong khu mới biết đường vào.',
    'Tiếng chợ sáng vang ra khỏi cổng ngõ — cái đồng hồ không dùng pin.',
    'Bọn trẻ con chơi quanh cái giếng cũ không ai còn dùng.',
    'Mùi ngập lũ sau cơn mưa lớn — mùi bùn, mùi đất ẩm, mùi nhà.',
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
