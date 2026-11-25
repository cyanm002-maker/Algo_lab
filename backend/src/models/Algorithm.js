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
    difficulty: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced'],
      default: 'Beginner'
    },
    summary: { type: String, required: true },
    theory: {
      overview: { type: String, required: true },
      intuition: { type: String, required: true },
      assumptions: [{ type: String }],
      complexity: {
        time: { type: String, default: '' },
        space: { type: String, default: '' }
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
