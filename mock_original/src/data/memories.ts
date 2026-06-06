import { MemoryLocation } from '../types';

export const MEMORY_LOCATIONS: MemoryLocation[] = [
  {
    id: 'thai-thinh',
    title: 'Góc của Trang',
    subTitle: 'Khu tập thể Thái Thịnh - Gác mái xỉn màu vàng',
    washiTitle: 'Thái Thịnh, Tiếng bàn phím lách cách',
    description: 'Nói đến Thái Thịnh là nói đến khu tập thể cổ kính ngập tràn bóng mát cây xà cừ. Ở đó có căn gác mái nhỏ của Trang và tiếng gõ phím cơ nhịp nhàng réo rắt lột tả một Hà Nội những năm đầu thế kỷ 21 chuyển mình.',
    mapArtUrl: 'thai-thinh-map',
    splatUrl: 'https://images.unsplash.com/photo-1505995433366-e12047f3f144?auto=format&fit=crop&w=800&q=80', // cozy old window with green shutters and sunlight
    hotspots: [
      {
        id: 'net-cafe',
        x: 32,
        y: 52,
        label: 'Quán Net lợp mái tôn',
        quote: 'Bản Audition vương nắng',
        voiceNote: 'Trang xúc động nhớ lại: "Cứ bốn rưỡi chiều tan học là cả đám trốn học, cộc cạch đạp xe ra hàng net góc phố. Tiếng phím gõ lách cách, quạt trần quay vù vù thổi hơi nóng nực. Nghe bài nhạc Audition Please Tell Me Why vang lên là bao lo âu học hành tan biến tiệt."',
        ambientSoundTrigger: 'keyboard',
        ghostIllustration: 'monitor'
      },
      {
        id: 'balcony-music',
        x: 72,
        y: 28,
        label: 'Ban công tầng ba cũ',
        quote: 'Tiếng đàn Vi-ô-lông lúc hoàng hôn',
        voiceNote: 'Trang kể: "Mỗi năm giờ chiều giáp tối, từ cái ban công hoen gỉ rủ dây trầu không nhà cụ Lâm lại vang lên tiếng đàn Violon chậm buồn sâu lắng. Nó hòa quyện cái nắng tắt cuối ngày tạo thành một bản tình ca Hà Nội đẹp thắt lòng."',
        ambientSoundTrigger: 'violin',
        ghostIllustration: 'bicycle'
      },
      {
        id: 'snail-stall',
        x: 48,
        y: 78,
        label: 'Gánh Ốc Nóng cuối ngõ',
        quote: 'Hương gừng sả lá chanh bùi ngậy',
        voiceNote: 'Trang chia sẻ: "Đĩa ốc luộc lá chanh chỉ dăm ba ngàn lẻ mà thơm lừng cả ngõ nhỏ gió heo may rét mướt. Đứa cầm tăm khêu, đứa húp bát xì xụp nước chấm đậm sả ớt, má đỏ hồng vì cay nồng ấm áp."',
        ambientSoundTrigger: 'plucks',
        ghostIllustration: 'bowlsnail'
      }
    ],
    keepsakes: [
      'Tiếng đàn vi-o-lon xa xăm từ góc ban công gỉ sét đơm hoa rủ rèm trầu không.',
      'Vị cay ấm lôi cuốn của gừng sả nồng nàn góc quán ốc vỉa hè Thái Thịnh những chiều gió bấc.',
      'Vết mòn trên phím cách của hàng net mái tôn ám khói thuốc, vang bóng nhạc Audition thuở nào.'
    ]
  },
  {
    id: 'thanh-cong',
    title: 'Ngõ của Essy',
    subTitle: 'Tập thể Thành Công - Hồ nước & Chiều đạp xe',
    washiTitle: 'Thành Công, Những chiều đạp xe',
    description: 'Trái tim của Thành Công là cụm nhà rêu phong bên bờ hồ phẳng lặng. Sân chơi đầy cát rộ vang tiếng nhạc aerobic và chiếc giếng khơi rêu phong chứng kiến một thời thơ dại đầy ắp tiếng cười rộn rã.',
    mapArtUrl: 'thanh-cong-map',
    splatUrl: 'https://images.unsplash.com/photo-1596401057633-5310d57f2615?auto=format&fit=crop&w=800&q=80', // retro bicycle close old wall
    hotspots: [
      {
        id: 'ancient-well',
        x: 52,
        y: 64,
        label: 'Chiếc Giếng cổ góc sân',
        quote: 'Mát lành dội ào xoa dịu nắng',
        voiceNote: 'Essy tủm tỉm kể: "Cạnh cái giếng khơi rêu bám xanh ngắt, tụi trẻ con chạy nhảy mệt nhoài lại xúm quanh cụ để dội gáo nước giếng khơi lạnh buốt vào vai, vào cổ. Nước giếng thuở ấy ngọt lịm, mát lịm, rửa trôi hết bụi bặm bùn bẩn nghịch ngợm."',
        ambientSoundTrigger: 'kids-laughter',
        ghostIllustration: 'well'
      },
      {
        id: 'aerobic-corner',
        x: 74,
        y: 45,
        label: 'Sân nhảy Aerobic loa phường',
        quote: 'Những nốt nhạc rộn rã rèn sức khỏe',
        voiceNote: 'Essy cười nói: "Mỗi năm rưỡi chiều, chiếc loa sắt gỉ đầu sân chơi lại rú lên nhạc nhảy tập thể dục aerobic vui tai của các cô các bà. Bọn trẻ vừa mút kem mút vừa trêu đùa bắt chước nhảy theo vô lo vô nghĩ."',
        ambientSoundTrigger: 'aerobic',
        ghostIllustration: 'slide'
      },
      {
        id: 'football-pitch',
        x: 28,
        y: 38,
        label: 'Bờ hồ Thành Công bóng xế',
        quote: 'Tiếng ve sầu hòa xích lô cọc cạch',
        voiceNote: 'Essy rạng rỡ: "Bên triền cỏ hồ Thành Công, tụi tôi dựng đôi dép làm gôn đá quả bóng nhựa bẹp dúm. Nắng vàng rót mật lên mặt hồ sóng sánh, thi thoảng có bác tài xích lô thong thả lăn bánh qua cười hiền."',
        ambientSoundTrigger: 'cicadas',
        ghostIllustration: 'pho'
      }
    ],
    keepsakes: [
      'Nước giếng khơi trong mát dội ào vỡ òa cái hanh hao se sắt nắng thu.',
      'Sân xích đu hỏng xơ xác rác lá sấu rụng, nơi có nụ cười giòn tan nhường hờn nhường dỗi.',
      'Tiếng loa nhảy rộn rã xập xình hòa cùng mùi lá sấu thối mục và mùi nắng Hà Nội dịu êm.'
    ]
  }
];
