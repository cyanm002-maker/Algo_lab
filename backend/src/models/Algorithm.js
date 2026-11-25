import mongoose from 'mongoose';

const FormulaSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    label: { type: String, required: true },
    latex: { type: String, required: true },
    description: { type: String, required: true }
  },
  { _id: false }
);

const HyperparameterSchema = new mongoose.Schema(
  {
    key: { type: String, required: true },
    label: { type: String, required: true },
    min: { type: Number, required: true },
    max: { type: Number, required: true },
    step: { type: Number, required: true },
    defaultValue: { type: Number, required: true },
    unit: { type: String, default: '' },
    description: { type: String, required: true }
  },
  { _id: false }
);

const AlgorithmSchema = new mongoose.Schema(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true
    },
    order: { type: Number, default: 0 },
    title: { type: String, required: true },
    subtitle: { type: String, default: '' },
    category: {
      type: String,
      enum: ['supervised', 'unsupervised'],
      required: true
    },
    visualizationType: {
      type: String,
      enum: ['2d', '3d'],
      required: true
    },
    supports2D3DToggle: { type: Boolean, default: false },
    difficulty: {
      type: String,
      enum: ['Foundational', 'Intermediate', 'Advanced'],
      default: 'Foundational'
    },
    summary: { type: String, required: true },
    evaluationChart: {
      type: { type: String, default: 'line' },
      title: { type: String, default: '' },
      xLabel: { type: String, default: '' },
      yLabel: { type: String, default: '' },
      description: { type: String, default: '' }
    },
    prosAndCons: {
      advantages: [{ type: String }],
      limitations: [{ type: String }],
      properties: {
        timeComplexity: { type: String, default: '' },
        spaceComplexity: { type: String, default: '' },
        interpretability: { type: String, default: '' },
        scalingRequired: { type: String, default: '' }
      },
      applications: [{ type: String }]
    },
    formulas: [FormulaSchema],
    hyperparameters: [HyperparameterSchema],
    defaultDataset: {
      type: mongoose.Schema.Types.Mixed,
      required: true
    },
    codeTemplates: {
      fromScratch: { type: String, required: true },
      scikitLearn: { type: String, required: true }
    }
  },
  {
    timestamps: true
  }
);

const Algorithm = mongoose.model('Algorithm', AlgorithmSchema);

export default Algorithm;
