import { Story } from '../types';

// Story A — LTK (Trang's brother) / Khu Thành Công
// Narrator: LTK. Daily route: ăn vặt cổng trường → hồ Thành Công → quán net
// KEY FACT from transcript: nhà LTK mở quán net — "về nhà chơi net" = literally về nhà.
// "Come out luôn là nhà mình mở quán net. Đấy là một tuổi thơ tuyệt vời."
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
      sublabel: 'Trường Tiểu học Thành Công A — tiệm thuê truyện, thẻ sưu tầm, kem son, kem chanh',
      bgGradient: 'linear-gradient(160deg, #f5e6c8 0%, #e8d5a3 40%, #d4b896 100%)',
      bgTone: '#c8a96e',
      bgImage: '/images/cong-truong.jpg',
      bgStreetView:
        'https://www.google.com/maps/embed?pb=!4v1780819620031!6m8!1m7!1sIiZLPt3-ifENZXNWcTQdxg!2m2!1d21.02304508332172!2d105.8139626145351!3f260.49747!4f0!5f0.7820865974627469',
      clues: [
        {
          id: 'trang-an-vat',
          type: 'routine',
          label: 'Kem chanh, kem son — và tiệm thuê truyện',
          quote:
            '"Ngày xưa tiếng trống vang lên mà đang đứng ăn kem chanh ở cổng thì thấy vội và sợ lắm."',
          voiceNote:
            'LTK nhớ rõ ba thứ ở cổng trường Thành Công A: một là tiệm thuê truyện Doraemon và thần thoại Hy Lạp, hai đến ba nghìn một ngày — "sharing economy, the first sharing economy model I know before Grab"; hai là mua thẻ bóng đá và thẻ Vinamilk để sưu tầm — "quyền lực của trẻ con nằm ở việc có nhiều đồ hơn bạn"; ba là kem chanh vì lớp không có điều hòa, và kem son — thỏi kem nhìn như son môi, vặn lên rồi liếm. Tiệm thuê truyện biến mất khi LTK lên lớp 4-5. Kem chanh biến mất khi lớp có điều hòa.',
          ambient: 'wind',
          x: 28,
          y: 58,
        },
        {
          id: 'trang-tieng-trong',
          type: 'sound',
          label: 'Tiếng trống — và những âm thanh vì không có điều hòa',
          quote:
            '"Không có điều hòa thì cửa phải mở — nên nghe được tất cả: tiếng chim, tiếng lớp bên, tiếng thầy cô sang mắng nhau."',
          voiceNote:
            'Lớp tiểu học Thành Công A không có điều hòa đến tận lớp ba lớp bốn. Cửa sổ luôn mở — tiếng từ bên ngoài tràn vào. LTK nhớ các thầy cô hay có drama: lớp này ồn ảnh hưởng lớp bên, thầy bên đó sang mắng. Tiếng trống trường đặc biệt nhiều cảm xúc — "đặc biệt là thấy vội, thấy sợ vì đến muộn, đặc biệt là khi đang ở cổng trường ăn vặt." Bây giờ đóng cửa bật máy lạnh, tiếng đó không còn.',
          ambient: 'wind',
          x: 68,
          y: 42,
        },
      ],
    },
    {
      id: 'ho-thanh-cong',
      label: 'Hồ Thành Công',
      sublabel: 'Cửa sau lách xe vào, bê tông gập ghềnh — con người Thành Công chả ai đi cửa chính',
      bgGradient: 'linear-gradient(160deg, #c8dde8 0%, #a3c4d5 40%, #7eaabf 100%)',
      bgTone: '#5a7a8a',
      bgImage: '/images/ho-thanh-cong.jpg',
      bgStreetView:
        'https://www.google.com/maps/embed?pb=!4v1780816975400!6m8!1m7!1sCAoSFkNJSE0wb2dLRUlDQWdJRFdzS0RJYVE.!2m2!1d21.01870719079754!2d105.8130115710941!3f69.82684308992756!4f-2.586612419766098!5f0.7820865974627469',
      clues: [
        {
          id: 'trang-xe-dap',
          type: 'routine',
          label: 'Tập xe đạp — và không thích chút nào',
          quote:
            '"Anh chả quan tâm đến hồ Thành Công. Ngày xưa bị ép tập đi xe đạp là không thấy thích rồi."',
          voiceNote:
            'Cuối tuần ông bà dẫn LTK ra hồ tập xe đạp. Hồi đó hồ bê tông gập ghềnh, không phải lát đá như bây giờ. Nhiều chó, mùi tanh vì cá chết nổi lềnh bềnh. LTK không thích vì sợ ngã trước mặt người — "không thích tập ở cái nơi mà người ta nhìn thấy mình ngã." Thích tập ở sân sau nhà bà ngoại hơn. Và vào trong hồ không phải qua cửa chính — "con người Thành Công chả bao giờ đi cửa chính." Họ đi cửa sau, một cái cửa không bao giờ mở ra hết, phải lách xe vào. Cái cửa đó đã bị tháo theo chính sách dỡ hàng rào công viên.',
          ambient: 'cicadas',
          x: 45,
          y: 62,
        },
        {
          id: 'trang-nhac-aerobic',
          type: 'sound',
          label: 'Tiếng nhạc aerobic chiều',
          quote:
            '"Buổi chiều nào cũng có nhạc aerobic vang ra từ cái loa sắt cũ ở sân — đó là dấu hiệu chiều đã về."',
          voiceNote:
            'Mỗi chiều ở hồ Thành Công, loa cộng đồng bật nhạc aerobic. Các cô các bà tập đều đặn, bọn trẻ đứng nhìn. Tiếng nhạc vang khắp khu — ai ở đây cũng nhớ. Bây giờ không còn.',
          ambient: 'aerobic',
          x: 72,
          y: 38,
        },
        {
          id: 'trang-khu-tap-the',
          type: 'loss',
          label: 'Cả phố là một nhà — cách sống sắp mất',
          quote:
            '"Một môi trường sống nguyên cả một khu phố là khu tập thể, tất cả biết nhau và sinh hoạt chỉ trong một phố — rất hiếm."',
          voiceNote:
            'LTK tiếc không chỉ vì những âm thanh hồi bé. Khu Thành Công là một mô hình sống riêng: cả phố là khu tập thể, mọi người biết tên nhau, sinh hoạt chỉ quanh vài con phố nhỏ. Khi giải tỏa, không chỉ nhà mất đi — cái cách người ta sống cùng nhau cũng mất theo. Bây giờ sống chung cư, không ai biết tên hàng xóm.',
          ambient: 'wind',
          x: 30,
          y: 35,
        },
      ],
    },
    {
      id: 'quan-net',
      label: 'Quán net — nhà mình mở',
      sublabel: 'Màn hình CRT to đùng, tiếng Audition "cọc cọc cọc" — và nhà mình mở quán',
      bgGradient: 'linear-gradient(160deg, #2a1f3d 0%, #3d2f5c 50%, #1a1228 100%)',
      bgTone: '#1a1228',
      bgImage: '/images/quan-net.jpg',
      // Real DJI Osmo 360 shots — 3 test nodes from 09/06 shoot
      bgTourNodes: [
        {
          id: 'node-01',
          panorama: '/tours/ltk-test/shot-01.jpg',
          clueAnchors: [{ clueId: 'trang-tieng-chui', yaw: 30, pitch: -5 }],
          navAnchors: [{ toNodeId: 'node-02', yaw: 0, pitch: -8, label: 'Tiếp tục' }],
        },
        {
          id: 'node-02',
          panorama: '/tours/ltk-test/shot-02.jpg',
          clueAnchors: [{ clueId: 'trang-choi-net', yaw: -40, pitch: 0 }],
          navAnchors: [
            { toNodeId: 'node-01', yaw: 180, pitch: -8, label: 'Quay lại' },
            { toNodeId: 'node-03', yaw: 0, pitch: -8, label: 'Tiếp tục' },
          ],
        },
        {
          id: 'node-03',
          panorama: '/tours/ltk-test/shot-03.jpg',
          navAnchors: [{ toNodeId: 'node-02', yaw: 180, pitch: -8, label: 'Quay lại' }],
        },
      ],
      clues: [
        {
          id: 'trang-tieng-chui',
          type: 'sound',
          label: 'Hai tiếng của quán net',
          quote:
            '"Tiếng ở trong quán net chỉ có hai thứ: tiếng hi hi ha ha chửi nhau — và tiếng gõ phím của mấy chị chơi Audition, cọc cọc cọc cọc."',
          voiceNote:
            'Quán net nhà LTK: full suit gồm màn hình CRT rất lồi và cục máy to đùng phía sau — "cái cây càng to thì cái màn hình càng bé." Con chuột, bàn phím, tai nghe, webcam. Hai âm thanh duy nhất: tiếng chửi khi thua game và tiếng gõ Audition "cọc cọc cọc cọc" — "rất là chất nghệ." Bố chỉ cho chơi một tiếng rồi căn giờ đón về ăn cơm.',
          ambient: 'keyboard',
          x: 35,
          y: 55,
        },
        {
          id: 'trang-choi-net',
          type: 'routine',
          label: 'Nhà mình mở quán net',
          quote:
            '"Come out luôn là nhà mình mở quán net. Đấy là một tuổi thơ tuyệt vời. Quán net còn có điều hòa."',
          voiceNote:
            'Điều LTK không nói thẳng từ đầu: tan học không phải đến quán net — là về nhà. Nhà mở quán net. Đó là lý do mỗi ngày tan học đều muốn về ngay — "anh rất hào hứng về nhà chơi điện tử." Và câu kết luận cho cả ngày: trường không có điều hòa, hồ bê tông gập ghềnh nhiều chó mùi tanh — nhưng nhà thì có điều hòa. "Quán net còn có điều hòa."',
          ambient: 'keyboard',
          x: 62,
          y: 48,
        },
      ],
    },
  ],
  routeClueIds: ['trang-an-vat', 'trang-xe-dap', 'trang-choi-net'],
  routeSlotLabels: ['Tan học, chạy ra...', 'Ghé qua hồ...', 'Cuối ngày...'],
  cannotBeMoved: [
    'Tiệm thuê truyện Doraemon ở cổng trường — hai nghìn một ngày, "sharing economy trước khi có Grab." Mất trước khi LTK hết cấp một.',
    'Kem chanh mua vì lớp không có điều hòa — khi trường lắp điều hòa, không ai bán kem chanh nữa.',
    'Tiếng thầy cô sang mắng nhau qua cửa sổ mở — bây giờ đóng cửa bật máy lạnh, không còn nghe gì.',
    'Cửa sau hồ Thành Công không bao giờ mở được hết, phải lách xe vào. Con người Thành Công chả bao giờ đi cửa chính.',
    'Mùi tanh hồ và chó lang thang — hồi đó bê tông gập ghềnh, không lát đá. Hàng rào sắt gỉ đã bị tháo.',
    'Tiếng Audition "cọc cọc cọc cọc" và tiếng chửi "hi hi ha ha" trong quán net có điều hòa — nhà mình mở, về là được chơi.',
  ],
  cluesNeededToUnlock: 4,
};

// Story B — Essy / Ngõ 267 Hoàng Hoa Thám
// Narrator: Essy. Address: số 17, 267/33 Hoàng Hoa Thám.
// Two identified losses: (1) tri thức địa phương — cách navigate ngõ mà chỉ người ở đây biết,
// (2) không gian xanh — cây + ngõ ngách + cà phê sân vườn, sẽ biến mất khi mở đường.
// Recording is exploratory (walk-around), not chronological — puzzle is spatial not time-based.
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
      sublabel: 'Số 17, 267/33 Hoàng Hoa Thám — rẽ ba bốn lần mới vào được, Grab không bao giờ tìm được',
      bgGradient: 'linear-gradient(160deg, #d4c5a9 0%, #c5b08a 40%, #b09060 100%)',
      bgTone: '#6b5a3e',
      bgImage: '/images/nha-ngo-alley.jpg',
      bgStreetView:
        'https://www.google.com/maps/embed?pb=!4v1780817061285!6m8!1m7!1s6dL2vzb0aYEtr1gNc0a2bw!2m2!1d21.01342417728203!2d105.8361921928282!3f51.4559087277337!4f-12.848211852718478!5f0.7820865974627469',
      clues: [
        {
          id: 'essy-ngo-kho',
          type: 'place',
          label: 'Chỉ người trong ngõ mới biết đường',
          quote:
            '"Essy biết tầm năm cách để đi vào nhà từ ba con đường khác nhau. Đây là ký ức chỉ những người sống ở đây mới có."',
          voiceNote:
            'Nhà Essy ở số 17, 267/33 Hoàng Hoa Thám — phải rẽ ba bốn lần từ đường chính mới vào được. Giữa Hoàng Hoa Thám, Văn Cao và Đội Cấn, Essy biết hơn năm đường vào nhà. Map không chỉ được chính xác — "phải phụ thuộc vào tri thức địa phương của những người sống ở đây lâu năm." Grab, Be, Xanh SM gần như không ai tự tìm được — Essy luôn phải ra đón hoặc chỉ đường qua điện thoại. Khi con đường mới mở, sẽ không ai cần navigate nữa. "Những cái ký ức của mình và những cái hiểu biết của mình về cái khu này sẽ không có cái tác dụng gì nữa."',
          ambient: 'wind',
          x: 40,
          y: 60,
        },
        {
          id: 'essy-cay-xanh-ngo',
          type: 'loss',
          label: 'Dãy nhà biệt lập — cây chanh, hoa nhài, và sự trong lành',
          quote:
            '"Mỗi lần đi vào cái khu biệt lập đó — ôi, một cái sự trong lành và mát mẻ mà có thể được ở đâu khác trên cái thành phố Hà Nội này nữa."',
          voiceNote:
            'Sáu bảy nhà trong một dãy biệt lập, gạch riêng, chia nhau một khoảng sân trồng cây chanh và hoa nhài. Essy gọi đây là một trong hai thứ sẽ mất nhất: không gian xanh giảm nhiệt, những "third place" mà cả khu đang có nhờ ngõ nhiều cây và cà phê sân vườn. Khi mở đường, cây sẽ bị xuống. "Những cái không gian đó ở trong thành phố Hà Nội hiếm rồi. Bây giờ khi giải tỏa hết thì mình còn mất nhiều hơn nữa."',
          ambient: 'wind',
          x: 25,
          y: 38,
        },
        {
          id: 'essy-ngap-mua',
          type: 'place',
          label: 'Ngập mùa mưa — ngõ sâu, hàng xóm biết nhau',
          quote: '"Vào mùa mưa, ngõ sâu hay bị ngập — nhưng đó là một phần của nhà."',
          voiceNote:
            'Mùa mưa ở Hà Nội, những ngõ sâu như ngõ nhà Essy hay bị ngập. Nhưng điều Essy nhớ hơn là cộng đồng trong đó: người đi những cung đường quen sẽ quen biết nhau — biết tên người bán cá, bán gà, và sẵn sàng nợ tiền nhau. "Like cả một cái gia đình và mọi người sẵn sàng nợ tiền nhau."',
          ambient: 'kids-laughter',
          x: 65,
          y: 45,
        },
      ],
    },
    {
      id: 'cho-tam',
      label: 'Chợ tạm',
      sublabel: 'Chợ tự phát ngõ 267 — người bán sống ở đó, mẹ lấy rau trả tiền sau',
      bgGradient: 'linear-gradient(160deg, #e8c87e 0%, #d4a84b 40%, #c08a2a 100%)',
      bgTone: '#8a6020',
      bgImage: '/images/cho-tam.jpg',
      clues: [
        {
          id: 'essy-cho-sang',
          type: 'routine',
          label: 'Chợ họp không cần ai tổ chức',
          quote:
            '"Mẹ mình thường ra lấy rau — không cần phải trả tiền luôn. Chỉ bảo: để mẹ Thanh chuyển sau."',
          voiceNote:
            'Chợ tự phát ở ngõ 267 Hoàng Hoa Thám: không tên, không biển hiệu, họp tự nhiên mỗi sáng. Người bán sống ngay tại đó — rau có, thịt có, cá có. Mẹ Essy lấy rau không cần trả tiền ngay — chuyển khoản sau. "Họ rất tin tưởng nhau. It\'s like, cả một cái gia đình." Đây là cái chợ mà những người ở gần Hoàng Hoa Thám và trong ngõ nhà Essy đều mua. Không thể copy sang chỗ mới.',
          ambient: 'wind',
          x: 50,
          y: 55,
        },
        {
          id: 'essy-tieng-cho',
          type: 'sound',
          label: 'Tiếng chợ thay đồng hồ báo thức',
          quote:
            '"Tiếng trả giá, tiếng rổ chén lanh canh — đó là buổi sáng. Khi chợ tan, biết là đã trưa."',
          voiceNote:
            'Không cần đặt đồng hồ. Tiếng chợ sáng là nhịp thời gian của cả khu — tiếng người, tiếng xe máy dừng, tiếng chén bát. Essy nhớ khi còn ngủ cũng nghe được chợ từ trong nhà.',
          ambient: 'kids-laughter',
          x: 73,
          y: 40,
        },
      ],
    },
    {
      id: 'gieng-khu-choi',
      label: 'Giếng / Khu vui chơi',
      sublabel: 'Con đường chỉ người trong khu mới biết — dẫn ra giếng cũ nay thành sân tập thể',
      bgGradient: 'linear-gradient(160deg, #a8c5a0 0%, #7da87a 40%, #5a8a56 100%)',
      bgTone: '#3a6a36',
      bgImage: '/images/gieng-khu-choi.jpg',
      clues: [
        {
          id: 'essy-tre-con-gieng',
          type: 'place',
          label: 'Con đường ra giếng — chỉ người trong khu biết',
          quote:
            '"Nó dẫn ra một cái giếng. Mình chưa thấy một ai mà không phải là người khu này mà biết cái đường đấy cả."',
          voiceNote:
            'Từ hướng Văn Cao, có một con đường nhỏ mà chỉ người trong khu mới biết — dẫn ra cái giếng cũ, nay được sửa thành khu tập thể dục. Bên trong ngõ có rất nhiều cây, tòa nhà xung quanh che nắng — mát hơn ngoài đường rất nhiều. Xung quanh giếng cũng có một cái chợ tự phát nhỏ nữa cho dân ở gần Văn Cao. Không có ai ngoài khu biết đến chỗ này.',
          ambient: 'kids-laughter',
          x: 42,
          y: 58,
        },
        {
          id: 'essy-gieng-mat',
          type: 'loss',
          label: 'Di tích quốc gia — sắp thành mặt đường',
          quote:
            '"Ở trong ngõ 267 có một cái chùa. Khả năng cao là sẽ thành mặt đường. Mọi người có thể lên tra."',
          voiceNote:
            'Essy kể điều làm nhiều người ngạc nhiên: trong ngõ 267 Hoàng Hoa Thám có một ngôi chùa — di tích quốc gia. Rất ít người Hà Nội biết. Và trong kế hoạch giải tỏa, di tích đó "rất sát với mặt đường hoặc là thành mặt đường." Một di tích quốc gia nằm trong cái khu mà Grab không bao giờ tìm được.',
          ambient: 'wind',
          x: 68,
          y: 35,
        },
        {
          id: 'essy-di-tich',
          type: 'place',
          label: 'Cà phê sân vườn — và cây sẽ bị xuống',
          quote:
            '"Trong khu này nổi tiếng nhất là cà phê sân vườn. Tại vì trong khu này nó có rất nhiều cây."',
          voiceNote:
            'Khu ngõ 267 gần đây trẻ hóa nhiều — ramen, cà phê học bài, cà phê sân vườn. Lý do nổi tiếng: rất nhiều cây, tòa nhà xung quanh che nắng — không gian xanh hiếm có giữa Hà Nội. Khi mở đường, những quán đó thành đường. Cây sẽ bị xuống. "Mình rất tiếc vì những cái không gian third place hoặc là những cái không gian giảm nhiệt như thế thực ra ở trong thành phố Hà Nội hiếm rồi."',
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
    'Cái bản đồ trong đầu — năm cách vào nhà từ ba con đường khác nhau, chỉ người ở đây mới biết.',
    'Tín chấp ở chợ tạm: "Để mẹ Thanh chuyển sau." Người bán người mua tin nhau như hàng xóm, vì họ là hàng xóm.',
    'Sân trong dãy nhà biệt lập — gạch riêng, cây chanh, hoa nhài, mát lạ giữa thành phố.',
    'Con đường ra giếng mà không ai không phải người khu này biết đến.',
    'Di tích quốc gia trong ngõ mà Grab không tìm được — sắp thành mặt đường.',
    'Cà phê sân vườn dưới tán cây — khi mở đường, cây sẽ bị xuống, những không gian đó không còn nữa.',
  ],
  cluesNeededToUnlock: 4,
};

// Story C — Trang / Khu Thái Thịnh (cụ thể là khu Trung Liệt)
// Narrator: Trang. Recording: solo, không có interviewer.
// Route: học thêm trước lớp 1 → đi qua sân chơi tập thể (chưa bao giờ được vào) → ăn ốc với mẹ
// Narrative arc: lưu trữ ký ức = hành trình tìm lại ký ức đã quên.
// "Song song với việc lưu giữ thì mình cũng đã tìm ra những ký ức mình quên mất."
const TRANG_THAI_THINH: Story = {
  id: 'thai-thinh',
  narrator: 'Trang',
  title: 'Khu Trung Liệt',
  subtitle: 'Những mảnh ký ức Trang đã quên — và tìm lại được trước khi khu này biến mất',
  coverColor: '#5a7a5a',
  spaces: [
    {
      id: 'nha-hoc-them',
      label: 'Lớp học thêm',
      sublabel: 'Gần cửa hàng mẹ — chiều 4-5 giờ mẹ dẫn đi bộ ra học, phố không một chiếc ô tô',
      bgGradient: 'linear-gradient(160deg, #f0e4c8 0%, #d9c49a 40%, #c4a870 100%)',
      bgTone: '#c4a870',
      bgStreetView:
        'https://www.google.com/maps/embed?pb=!4v1780820583291!6m8!1m7!1snheqPSx9wL8wlbrOwbyaPA!2m2!1d21.00703573799342!2d105.8209283929959!3f95.24497199044959!4f8.04312926871205!5f0.7820865974627469',
      clues: [
        {
          id: 'thai-thinh-hoc-them',
          type: 'routine',
          label: 'Chiều 4-5 giờ, mẹ dẫn đi bộ ra lớp học thêm',
          quote:
            '"Ăn trưa xong, nhà mình nghỉ một chút. Sau đó tầm bốn năm giờ, mẹ mình bắt đầu dẫn mình đi bộ ra lớp học thêm."',
          voiceNote:
            'Nhà Trang làm cửa hàng ở khu Trung Liệt — không phải nhà ở. Mẹ hay đưa Trang sang đó ăn trưa rồi từ đó đi học thêm trước lớp một. Con phố hồi đó rất vắng — lần cuối Trang nhớ thấy phố đó, chưa bao giờ có ô tô. Đường Nguyễn Văn Tuyết hồi đó còn là cái mương — không có xe nào đi qua. Gần đây Trang đi làm về qua đó, thấy một chiếc ô tô đỗ — "đấy là một cái cảm xúc khá là lạ." Bây giờ đường mương đó thành phố ẩm thực, tối có tiếng bar sàn.',
          ambient: 'plucks',
          x: 38,
          y: 55,
        },
        {
          id: 'thai-thinh-pho-khong-xe',
          type: 'sound',
          label: 'Phố yên tĩnh — âm thanh trước khi mương thành đường',
          quote:
            '"Tuổi thơ của mình đã ở trong một con phố đấy rất yên bình, không có xe cộ, không có ai đi qua — hầu hết là hàng xóm biết nhau thôi."',
          voiceNote:
            'Đường Nguyễn Văn Tuyết từng là mương thoát nước — không xe, không tiếng động. Sau khi lấp mương mở đường, nó thành phố ẩm thực đông đúc, "đến buổi tối thì nó sẽ có tiếng bar sàn xập xình." Trang gọi đây là cái cảm xúc lạ: cùng một chỗ, cách nhau mười mấy năm, xe máy đã được thay bằng ô tô.',
          ambient: 'wind',
          x: 65,
          y: 42,
        },
      ],
    },
    {
      id: 'san-choi-tap-the',
      label: 'Sân chơi khu tập thể',
      sublabel: 'Đi qua vô số lần — chưa bao giờ được vào chơi một lần nào',
      bgGradient: 'linear-gradient(160deg, #b8d4b0 0%, #8aba88 40%, #6a9866 100%)',
      bgTone: '#6a9866',
      bgStreetView:
        'https://www.google.com/maps/embed?pb=!4v1780820391133!6m8!1m7!1sCAoSFENJSE0wb2dLRUlDQWdJRHFoWWNy!2m2!1d21.00737043585037!2d105.8205676505939!3f24.670416281318587!4f-21.52419316897445!5f0.7820865974627469',
      clues: [
        {
          id: 'thai-thinh-san-choi',
          type: 'loss',
          label: 'Đến tận bây giờ vẫn chưa bao giờ được vào chơi',
          quote:
            '"Đến tận ngày hôm nay mình vẫn chưa bao giờ được vào cái sân chơi đó để chơi, mặc dù mình đã đi qua nó vô số lần."',
          voiceNote:
            'Trên đường đi học thêm mỗi buổi chiều, Trang đi qua sân chơi khu tập thể. Thấy các bạn chơi, nhưng không được dừng lại — luôn phải đến cửa hàng, luôn phải đi học. "Chỉ đơn giản là một đứa trẻ đang rất là muốn đi chơi và nó bị bắt đi học thôi. Nó là cái cảm giác mình không bao giờ trải nghiệm lại được nữa vì mình đã lớn rồi." Nếu khu bị giải tỏa, Trang sẽ không còn cái trigger để đi qua và nhớ lại cảm giác đó nữa.',
          ambient: 'kids-laughter',
          x: 50,
          y: 58,
        },
        {
          id: 'thai-thinh-tieng-cuoi',
          type: 'sound',
          label: 'Tiếng cười từ sân chơi — nghe khi đi qua',
          quote:
            '"Nó là cái cảm giác mà chỉ có mình mình cảm nhận được thôi và cũng không diễn tả được thành lời."',
          voiceNote:
            'Trang không gọi đây là ghen tị. Chỉ là cái cảm giác của một đứa năm tuổi muốn được ở lại chơi, muốn lăn ra ăn vạ để ở lại. Cái cảm giác đó không biến mất — đến bây giờ khi đi qua phố đó, nó vẫn ùa về. Khi phố bị giải tỏa, cả cái trigger đó cũng mất theo.',
          ambient: 'kids-laughter',
          x: 72,
          y: 40,
        },
      ],
    },
    {
      id: 'quan-oc-violin',
      label: 'Quán ốc ông violin',
      sublabel: 'Mẹ dẫn đi ăn để an ủi — và lần đầu tiên Trang biết violin là gì',
      bgGradient: 'linear-gradient(160deg, #e8c890 0%, #d4a060 40%, #b87840 100%)',
      bgTone: '#c48040',
      bgStreetView:
        'https://www.google.com/maps/embed?pb=!4v1780820625916!6m8!1m7!1sBlkVKUqklBllqb97pCc7CA!2m2!1d21.01136206591828!2d105.820488192404!3f132.81658590355357!4f-8.126131387858834!5f0.7820865974627469',
      clues: [
        {
          id: 'thai-thinh-vio-oc',
          type: 'sound',
          label: 'Lần đầu tiên nghe violin — ở quán ốc',
          quote:
            '"Ở quán ốc đó thì bác ấy đánh violin. Đấy là lần đầu tiên mình biết violin là gì và chơi như thế nào."',
          voiceNote:
            'Hôm đó Trang dùng tẩy với bút máy — vi phạm nội quy, cô giáo có thước to đánh vào tay học sinh. Trang khóc cả đường về. Mẹ dẫn đi ăn ốc để an ủi — và ở quán đó ông chủ đánh violin. Trang nghĩ violin có thể chơi ở mọi nơi, kể cả quán ốc. Lớn lên mới biết violin là nhạc cụ của dàn giao hưởng. "Đối với mình bây giờ violin vẫn là cái gì đó khá là gần gũi — bởi vì lần đầu tiên mình thấy violin là khi mình nghe nó ở quán ốc."',
          ambient: 'violin',
          x: 45,
          y: 55,
        },
        {
          id: 'thai-thinh-di-voi-me',
          type: 'routine',
          label: 'Quán ốc chỉ người khu này biết — nay nổi TikTok',
          quote:
            '"Sẽ không có một đứa trẻ nào nhìn thấy violin lần đầu tiên ở trong một quán ốc nữa."',
          voiceNote:
            'Hồi bé quán ốc đó chỉ có cư dân trong khu biết. "Cái lối sống ngày xưa rất mang tính làng xóm — riêng một khu vực sống với nhau thì biết về nhau thôi." Bây giờ quán nổi trên TikTok. Trang không biết quán có nằm trong diện giải tỏa không, nhưng nếu có — "sẽ không còn ai cảm nhận được violin giống như mình đã cảm nhận violin nữa."',
          ambient: 'violin',
          x: 65,
          y: 45,
        },
      ],
    },
  ],
  routeClueIds: ['thai-thinh-hoc-them', 'thai-thinh-san-choi', 'thai-thinh-vio-oc'],
  routeSlotLabels: ['Chiều từ cửa hàng mẹ...', 'Đi qua sân chơi...', 'Ăn ốc với mẹ...'],
  cannotBeMoved: [
    'Con phố Trung Liệt khi đường Nguyễn Văn Tuyết còn là mương — không một chiếc ô tô, hàng xóm biết nhau.',
    'Cái sân chơi khu tập thể Trang đã đi qua vô số lần và chưa bao giờ được vào.',
    'Cảm giác năm tuổi muốn lăn ra ăn vạ để được ở lại chơi — chỉ nhớ lại được khi đi qua phố đó.',
    'Lần đầu tiên nghe violin ở quán ốc nhỏ trong ngõ — và nghĩ violin có thể chơi ở mọi nơi.',
    'Cái ngày khóc vì dùng tẩy với bút máy, mẹ dẫn đi ăn ốc để an ủi — "mình đã sợ những thứ khác và không sợ cái tẩy nữa."',
    'Hành trình lưu trữ ký ức, thực ra, cũng là hành trình tìm lại những thứ tưởng đã quên.',
  ],
  cluesNeededToUnlock: 4,
};

export const ALL_STORIES: Story[] = [TRANG, TRANG_THAI_THINH, ESSY];
