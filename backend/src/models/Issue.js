const mongoose = require('mongoose');

const issueSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide an issue title'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters']
    },

    description: {
      type: String,
      required: [true, 'Please provide an issue description'],
      maxlength: [1000, 'Description cannot exceed 1000 characters']
    },

    category: {
      type: mongoose.Schema.ObjectId,
      ref: 'Category',
      required: [true, 'Please assign a category']
    },

    images: {
      type: [String],
      default: [],
      validate: [
        arrayLimit,
        'You can upload a maximum of 5 images'
      ]
    },

    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },

      coordinates: {
        type: [Number],
        required: false
      }
    },

    address: {
      type: String,
      trim: true,
      default: ''
    },

    reportedBy: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true
    },

    assignedOfficer: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      default: null
    },

    status: {
      type: String,
      enum: [
        'Submitted',
        'Under Review',
        'Assigned',
        'In Progress',
        'Resolved',
        'Rejected',
        'Reopened'
      ],
      default: 'Submitted'
    },

    statusHistory: [
      {
        status: {
          type: String,
          required: true
        },

        changedBy: {
          type: mongoose.Schema.ObjectId,
          ref: 'User',
          required: true
        },

        remarks: {
          type: String
        },

        changedAt: {
          type: Date,
          default: Date.now
        }
      }
    ],

    priority: {
      type: String,
      enum: [
        'Low',
        'Medium',
        'High',
        'Critical'
      ],
      default: 'Medium'
    },

    upvotes: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
      }
    ],

    resolutionDetails: {
      remarks: {
        type: String,
        default: null
      },

      imageUrls: {
        type: [String],
        default: [],
        validate: [
          arrayLimit,
          'You can upload a maximum of 5 resolution images'
        ]
      },

      // Kept for backward compatibility
      // with older data/clients.
      imageUrl: {
        type: String,
        default: null
      },

      resolvedAt: {
        type: Date,
        default: null
      }
    }
  },

  {
    timestamps: true,

    toJSON: {
      virtuals: true
    },

    toObject: {
      virtuals: true
    }
  }
);

function arrayLimit(val) {
  return val.length <= 5;
}

issueSchema.index({
  status: 1
});

issueSchema.index({
  reportedBy: 1
});

issueSchema.index({
  assignedOfficer: 1
});

issueSchema.index({
  location: '2dsphere'
});

issueSchema.virtual('comments', {
  ref: 'Comment',
  localField: '_id',
  foreignField: 'issue',
  justOne: false
});

module.exports = mongoose.model(
  'Issue',
  issueSchema
);