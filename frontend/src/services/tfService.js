import * as tf from '@tensorflow/tfjs';
import * as use from '@tensorflow-models/universal-sentence-encoder';

class TensorFlowService {
  constructor() {
    this.model = null;
    this.isInitialized = false;
    this.batchSize = 32;
    this.embeddingCache = new Map();
  }

  async initialize() {
    if (this.isInitialized) return;

    try {
      // Initialize backend
      if (tf.findBackend('webgl')) {
        await tf.setBackend('webgl');
        // Configure WebGL for better performance
        tf.env().set('WEBGL_CPU_FORWARD', false);
        tf.env().set('WEBGL_PACK', true);
        console.log('Using WebGL backend');
      } else {
        await tf.setBackend('cpu');
        console.log('Using CPU backend');
      }

      await tf.ready();
      
      // Enable memory management optimizations
      tf.enableProdMode();
      
      this.isInitialized = true;
    } catch (error) {
      console.warn('TF initialization failed:', error);
      // Ensure we at least have CPU backend
      await tf.setBackend('cpu');
      await tf.ready();
    }
  }

  async loadModel() {
    if (!this.model) {
      await this.initialize();
      
      console.log('Loading Universal Sentence Encoder model...');
      this.model = await use.load();

      // Warmup the model with a dummy input
      const warmupInput = ['warmup'];
      await this.model.embed(warmupInput);
      console.log('Model loaded and warmed up');
    }
    return this.model;
  }

  async embedText(texts) {
    const model = await this.loadModel();
    
    // Convert single text to array
    const textArray = Array.isArray(texts) ? texts : [texts];
    
    // Check cache first
    const uncachedTexts = [];
    const embeddings = [];
    const textToIndexMap = new Map();

    textArray.forEach((text, index) => {
      const cached = this.embeddingCache.get(text);
      if (cached) {
        embeddings[index] = cached;
      } else {
        uncachedTexts.push(text);
        textToIndexMap.set(text, index);
      }
    });

    if (uncachedTexts.length > 0) {
      // Process in batches
      for (let i = 0; i < uncachedTexts.length; i += this.batchSize) {
        const batch = uncachedTexts.slice(i, i + this.batchSize);
        
        // Embed batch - don't use tidy here since model.embed is async
        const batchEmbeddings = await model.embed(batch);
        
        // Store results in cache and embeddings array
        const embeddingArray = await batchEmbeddings.array();
        batch.forEach((text, batchIndex) => {
          const originalIndex = textToIndexMap.get(text);
          embeddings[originalIndex] = embeddingArray[batchIndex];
          this.embeddingCache.set(text, embeddingArray[batchIndex]);
        });

        // Manually dispose of tensors
        batchEmbeddings.dispose();

        // Log progress for large batches
        if (uncachedTexts.length > this.batchSize) {
          console.log(`Processed ${Math.min((i + this.batchSize), uncachedTexts.length)} of ${uncachedTexts.length} texts`);
        }
      }
    }

    // Clean up old cache entries if cache gets too large
    if (this.embeddingCache.size > 1000) {
      const entries = Array.from(this.embeddingCache.entries());
      entries.slice(0, 500).forEach(([key]) => this.embeddingCache.delete(key));
    }

    // Manual garbage collection of tensors
    const startingTensors = tf.memory().numTensors;
    if (startingTensors > 50) {
      tf.disposeVariables();
    }

    return tf.tensor(embeddings);
  }

  clearCache() {
    this.embeddingCache.clear();
    tf.disposeVariables();
    console.log('Cache cleared and tensors disposed');
  }

  async dispose() {
    this.clearCache();
    if (this.model) {
      this.model.dispose();
      this.model = null;
    }
    this.isInitialized = false;
    console.log('TensorFlow service disposed');
  }
}

export const tfService = new TensorFlowService();