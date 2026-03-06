export const mockChapters = [
    { id: 1, title: 'Introduction to AI', duration: '5:30', timestamp: 0 },
    { id: 2, title: 'Machine Learning Basics', duration: '12:15', timestamp: 330 },
    { id: 3, title: 'Deep Learning Concepts', duration: '15:45', timestamp: 1065 },
    { id: 4, title: 'Neural Networks Architecture', duration: '10:20', timestamp: 2010 },
    { id: 5, title: 'Future of AI', duration: '7:50', timestamp: 2630 },
];

export const mockTakeaways = {
    1: [
        'AI is the simulation of human intelligence in machines.',
        'It encompasses various subfields like ML and DL.',
        'Early AI systems were rule-based (expert systems).',
    ],
    2: [
        'Machine learning relies on pattern recognition.',
        'Supervised vs Unsupervised learning are core paradigms.',
        'Data quality is crucial for ML model performance.',
    ],
    3: [
        'Deep learning uses artificial neural networks with multiple layers.',
        'Can automatically learn hierarchical feature representations.',
        'Requires significant compute power (GPUs).',
    ],
    4: [
        'Neurons, weights, biases, and activation functions.',
        'Feedforward vs Recurrent Neural Networks (RNNs).',
        'Convolutional Neural Networks (CNNs) for vision tasks.',
    ],
    5: [
        'Generative AI is shifting the landscape of creativity.',
        'Ethical considerations and bias in automated decisions.',
        'The path towards Artificial General Intelligence (AGI).',
    ]
};

export const mockQuestions = [
    {
        id: 1,
        question: 'What is the primary function of a neural network activation function?',
        options: [
            'To store data temporarily',
            'To introduce non-linearity to the network',
            'To reduce the loss to exactly zero',
            'To define the number of hidden layers'
        ],
        correctAnswer: 1
    },
    {
        id: 2,
        question: 'Which type of learning involves training on heavily labeled data?',
        options: [
            'Unsupervised Learning',
            'Reinforcement Learning',
            'Supervised Learning',
            'Self-supervised Learning'
        ],
        correctAnswer: 2
    },
    {
        id: 3,
        question: 'What does CNN stand for in the context of Deep Learning?',
        options: [
            'Computer Neural Node',
            'Convolutional Neural Network',
            'Central Network Node',
            'Complex Neural Node'
        ],
        correctAnswer: 1
    }
];
