import os
import glob
import time
import numpy as np
from keras import applications
from keras.applications.vgg19 import preprocess_input
from keras.preprocessing import image
from keras.models import Model


base_model = applications.vgg19.VGG19(include_top=True, weights='imagenet', input_tensor=None,
                                      input_shape=None, pooling=None, classes=1000)

data_path = os.path.abspath('../../data/umpire_non_umpire_train')
save_path = os.path.abspath('../../features/vgg19')
classes = ['non_umpire', 'umpire']

# Create save path if it doesn't exist
os.makedirs(save_path, exist_ok=True)

start_time = time.time()
layers_to_extract = ['fc1']

for layer_num in range(len(layers_to_extract)):
    # Update Model instantiation to avoid deprecation warning
    model = Model(inputs=base_model.input, outputs=base_model.get_layer(layers_to_extract[layer_num]).output)

    for cls in range(1, 3):
        img_count = 0
        feats = []

        print(f"Processing class: {classes[cls - 1]}")

        for image_path in glob.glob(f'{data_path}/{classes[cls - 1]}*'):
            img_count += 1
            print(f"Loading image {img_count}: {image_path}")

            # Pre-processing with error handling
            try:
                img = image.load_img(image_path, target_size=(224, 224))
                x_in = image.img_to_array(img)
                x_in = np.expand_dims(x_in, axis=0)
                x_in = preprocess_input(x_in)

                # Feature Extraction
                features = model.predict(x_in)
                features = features.flatten()
                feats.append(features)
            except Exception as e:
                print(f"Error loading image {image_path}: {e}")
                continue  # Skip to the next image

        if feats:  # Only proceed if feats is not empty
            feature_list = np.squeeze(np.asarray(feats))
            labels = np.ones(len(feature_list)) * cls
            feature_list = np.column_stack((feature_list, labels))

            # Save the features as numpy array for further processing
            np.save(f'{save_path}/model1_vgg19_{layers_to_extract[layer_num]}_features_{classes[cls - 1]}.npy',
                    feature_list)

print("--- %s seconds ---" % (time.time() - start_time))
