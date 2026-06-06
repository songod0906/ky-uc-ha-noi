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
      bgTone: '#e8d5a3',
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
      bgTone: '#a3c4d5',
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
      bgTone: '#2a1f3d',
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
      bgTone: '#c5b08a',
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
      bgTone: '#d4a84b',
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
      bgTone: '#7da87a',
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

export const ALL_STORIES: Story[] = [TRANG, ESSY];
