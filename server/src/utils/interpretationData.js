/**
 * Basic interpretation data for zodiac signs, planets, houses, and aspects
 */
const interpretations = {
  signs: {
    'Aries': {
      element: 'Fire',
      quality: 'Cardinal',
      keywords: ['initiative', 'courage', 'impulsiveness', 'leadership'],
      description: 'Aries is the first sign of the zodiac, representing new beginnings, leadership, and self-discovery. Ruled by Mars, Aries energy is bold, direct, and confident.'
    },
    'Taurus': {
      element: 'Earth',
      quality: 'Fixed',
      keywords: ['stability', 'sensuality', 'practicality', 'stubbornness'],
      description: 'Taurus is the second sign of the zodiac, representing stability, sensuality, and material comfort. Ruled by Venus, Taurus energy is patient, reliable, and appreciative of beauty.'
    },
    'Gemini': {
      element: 'Air',
      quality: 'Mutable',
      keywords: ['communication', 'curiosity', 'adaptability', 'duality'],
      description: 'Gemini is the third sign of the zodiac, representing communication, curiosity, and social connection. Ruled by Mercury, Gemini energy is quick-witted, versatile, and intellectually agile.'
    },
    'Cancer': {
      element: 'Water',
      quality: 'Cardinal',
      keywords: ['nurturing', 'emotional depth', 'intuition', 'security'],
      description: 'Cancer is the fourth sign of the zodiac, representing nurturing, emotional depth, and domestic life. Ruled by the Moon, Cancer energy is sensitive, protective, and deeply connected to the past.'
    },
    'Leo': {
      element: 'Fire',
      quality: 'Fixed',
      keywords: ['creativity', 'leadership', 'passion', 'confidence'],
      description: 'Leo is the fifth sign of the zodiac, representing creativity, leadership, and self-expression. Ruled by the Sun, Leo energy is warm, generous, and naturally assumes a central role.'
    },
    'Virgo': {
      element: 'Earth',
      quality: 'Mutable',
      keywords: ['analysis', 'service', 'practicality', 'perfection'],
      description: 'Virgo is the sixth sign of the zodiac, representing analysis, service, and attention to detail. Ruled by Mercury, Virgo energy is methodical, practical, and devoted to improvement.'
    },
    'Libra': {
      element: 'Air',
      quality: 'Cardinal',
      keywords: ['balance', 'harmony', 'relationships', 'diplomacy'],
      description: 'Libra is the seventh sign of the zodiac, representing balance, relationships, and social harmony. Ruled by Venus, Libra energy is diplomatic, fair-minded, and seeks connection.'
    },
    'Scorpio': {
      element: 'Water',
      quality: 'Fixed',
      keywords: ['intensity', 'depth', 'transformation', 'mystery'],
      description: 'Scorpio is the eighth sign of the zodiac, representing intensity, transformation, and psychological depth. Ruled by Pluto, Scorpio energy is passionate, perceptive, and powerfully transformative.'
    },
    'Sagittarius': {
      element: 'Fire',
      quality: 'Mutable',
      keywords: ['exploration', 'philosophy', 'freedom', 'optimism'],
      description: 'Sagittarius is the ninth sign of the zodiac, representing exploration, higher learning, and the quest for truth. Ruled by Jupiter, Sagittarius energy is optimistic, philosophical, and freedom-loving.'
    },
    'Capricorn': {
      element: 'Earth',
      quality: 'Cardinal',
      keywords: ['ambition', 'discipline', 'responsibility', 'tradition'],
      description: 'Capricorn is the tenth sign of the zodiac, representing ambition, structure, and worldly achievement. Ruled by Saturn, Capricorn energy is disciplined, responsible, and focused on long-term goals.'
    },
    'Aquarius': {
      element: 'Air',
      quality: 'Fixed',
      keywords: ['innovation', 'community', 'independence', 'originality'],
      description: 'Aquarius is the eleventh sign of the zodiac, representing innovation, community, and progress. Ruled by Uranus, Aquarius energy is forward-thinking, humanitarian, and values both independence and collective welfare.'
    },
    'Pisces': {
      element: 'Water',
      quality: 'Mutable',
      keywords: ['spirituality', 'compassion', 'imagination', 'empathy'],
      description: 'Pisces is the twelfth sign of the zodiac, representing spirituality, compassion, and the realm of dreams. Ruled by Neptune, Pisces energy is intuitive, artistic, and deeply connected to the universal.'
    }
  },
  
  planets: {
    'Sun': {
      keywords: ['identity', 'ego', 'purpose', 'vitality'],
      description: 'The Sun represents your core essence, sense of self, and conscious identity. It shows how you express yourself to the world and where your vital energy is focused.'
    },
    'Moon': {
      keywords: ['emotions', 'instincts', 'needs', 'nurturing'],
      description: 'The Moon represents your emotional nature, unconscious patterns, habitual reactions, and what you need to feel secure. It influences how you nurture yourself and others.'
    },
    'Mercury': {
      keywords: ['communication', 'thinking', 'learning', 'perception'],
      description: 'Mercury represents your mental processes, how you communicate, learn, and process information. It influences your intellectual approach and verbal expression.'
    },
    'Venus': {
      keywords: ['love', 'beauty', 'values', 'attraction'],
      description: 'Venus represents your approach to love, beauty, pleasure, and what you value. It influences your aesthetic preferences, how you express affection, and what you find attractive.'
    },
    'Mars': {
      keywords: ['action', 'energy', 'desire', 'courage'],
      description: 'Mars represents your drive, assertiveness, passion, and how you take action. It influences your energy levels, competitive spirit, and how you pursue what you want.'
    },
    'Jupiter': {
      keywords: ['expansion', 'growth', 'opportunity', 'optimism'],
      description: 'Jupiter represents growth, abundance, faith, and how you expand your horizons. It influences your philosophical outlook, capacity for opportunity, and sense of meaning.'
    },
    'Saturn': {
      keywords: ['structure', 'responsibility', 'limitation', 'discipline'],
      description: 'Saturn represents structure, discipline, responsibility, and life\'s lessons. It influences your sense of duty, where you face challenges, and how you build lasting foundations.'
    },
    'Uranus': {
      keywords: ['innovation', 'rebellion', 'freedom', 'change'],
      description: 'Uranus represents innovation, originality, and sudden change. It influences where you seek freedom, express your uniqueness, and experience breakthroughs.'
    },
    'Neptune': {
      keywords: ['spirituality', 'dreams', 'illusion', 'compassion'],
      description: 'Neptune represents spirituality, imagination, and the dissolution of boundaries. It influences your dreams, ideals, intuition, and where you may experience confusion or transcendence.'
    },
    'Pluto': {
      keywords: ['transformation', 'power', 'rebirth', 'depth'],
      description: 'Pluto represents deep transformation, power dynamics, and the cycle of death and rebirth. It influences where you experience profound change and encounter your shadow side.'
    },
    'North Node': {
      keywords: ['destiny', 'growth', 'evolution', 'potential'],
      description: 'The North Node represents your soul\'s growth direction in this lifetime. It indicates qualities and experiences you\'re meant to develop for spiritual evolution.'
    },
    'Chiron': {
      keywords: ['wounds', 'healing', 'teaching', 'integration'],
      description: 'Chiron represents your core wound and path to healing. It shows where you\'ve been hurt, how you can heal, and the wisdom you can share with others from your experiences.'
    }
  },
  
  houses: {
    1: {
      keywords: ['self', 'identity', 'appearance', 'beginnings'],
      description: 'The 1st house represents your self-image, physical appearance, and how you initiate things. Planets here strongly influence your personality and how others perceive you.'
    },
    2: {
      keywords: ['resources', 'values', 'possessions', 'talents'],
      description: 'The 2nd house represents your personal resources, values, earnings, and sense of self-worth. Planets here influence your relationship with money and material security.'
    },
    3: {
      keywords: ['communication', 'learning', 'siblings', 'neighborhood'],
      description: 'The 3rd house represents communication, early education, siblings, and your immediate environment. Planets here influence how you think, speak, and process information.'
    },
    4: {
      keywords: ['home', 'family', 'roots', 'emotions'],
      description: 'The 4th house represents your home, family origins, and emotional foundations. Planets here influence your sense of belonging, security, and connection to the past.'
    },
    5: {
      keywords: ['creativity', 'pleasure', 'children', 'self-expression'],
      description: 'The 5th house represents creativity, play, romance, and self-expression. Planets here influence your artistic talents, approach to pleasure, and relationship with children.'
    },
    6: {
      keywords: ['service', 'health', 'routine', 'refinement'],
      description: 'The 6th house represents daily work, health routines, and service to others. Planets here influence your organizational skills, health patterns, and how you help others.'
    },
    7: {
      keywords: ['partnerships', 'balance', 'cooperation', 'contracts'],
      description: 'The 7th house represents one-to-one relationships, marriage, business partnerships, and open enemies. Planets here influence how you relate to others and seek balance.'
    },
    8: {
      keywords: ['transformation', 'shared resources', 'intimacy', 'mystery'],
      description: 'The 8th house represents shared resources, deep intimacy, transformation, and the mysteries of life and death. Planets here influence your approach to merging with others.'
    },
    9: {
      keywords: ['expansion', 'philosophy', 'travel', 'higher learning'],
      description: 'The 9th house represents higher education, long-distance travel, philosophy, and belief systems. Planets here influence your worldview and quest for meaning.'
    },
    10: {
      keywords: ['career', 'reputation', 'authority', 'public image'],
      description: 'The 10th house represents your career, public reputation, authority, and life direction. Planets here influence your professional path and how you\'re seen by society.'
    },
    11: {
      keywords: ['friendships', 'groups', 'hopes', 'innovation'],
      description: 'The 11th house represents friendships, social groups, humanitarian interests, and future visions. Planets here influence your social circles and contribution to collective causes.'
    },
    12: {
      keywords: ['spirituality', 'unconscious', 'isolation', 'compassion'],
      description: 'The 12th house represents the unconscious mind, spiritual transcendence, hidden strengths, and self-undoing. Planets here influence your inner world and connection to the divine.'
    }
  },
  
  aspects: {
    'Conjunction': {
      symbol: '☌',
      angle: 0,
      nature: 'blending',
      description: 'The conjunction represents a blending of energies that intensifies and focuses both planets involved. It can be harmonious or challenging depending on the planets.'
    },
    'Sextile': {
      symbol: '⚹',
      angle: 60,
      nature: 'harmonious',
      description: 'The sextile represents easy, harmonious energy flow between planets. It offers opportunities that can be utilized with some effort and brings creative potential.'
    },
    'Square': {
      symbol: '□',
      angle: 90,
      nature: 'challenging',
      description: 'The square represents tension and challenges between planets. It creates friction that motivates action and growth, though it may initially be experienced as conflict.'
    },
    'Trine': {
      symbol: '△',
      angle: 120,
      nature: 'harmonious',
      description: 'The trine represents easy, natural flow between planets. It brings harmony, talents, and effortless integration of the energies involved.'
    },
    'Opposition': {
      symbol: '☍',
      angle: 180,
      nature: 'polarizing',
      description: 'The opposition represents a polarity between planets that creates awareness through tension. It highlights the need for balance and integration of seemingly opposing forces.'
    }
  }
};

module.exports = interpretations;
