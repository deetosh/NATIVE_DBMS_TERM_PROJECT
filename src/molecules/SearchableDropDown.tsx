import React, {use, useEffect, useRef} from 'react';
import {StyleSheet, ViewStyle} from 'react-native';
import {AutocompleteDropdown} from 'react-native-autocomplete-dropdown';
import {COLOR} from '../constants';

// Define the shape of dropdown items
export interface DropdownItem {
  id: string;
  title?: string | null | undefined;
}

interface Props {
  data: DropdownItem[];
  setSelected: (item: string | null) => void;
  selected?: string | null;
  placeholder?: string;
  containerStyle?: ViewStyle;
}

const SearchableDropdown: React.FC<Props> = ({
  data,
  setSelected,
  selected,
  placeholder = 'Search...',
  containerStyle,
}) => {
  const autoCompleteRef = useRef<any>(null);
  const handleSelect = (item: DropdownItem | null) => {
    if (item) {
      setSelected(item.id);
    }
  };

  const handleClear = () => {
    setSelected(null);
  };

  useEffect(() => {
    if (!selected || selected === '') {
      autoCompleteRef.current?.clear();
    }
  }, [selected]);

  return (
    <AutocompleteDropdown
      clearOnFocus={false}
      closeOnBlur={true}
      closeOnSubmit={false}
      dataSet={data}
      onClear={handleClear}
      onSelectItem={handleSelect}
      textInputProps={{
        placeholder,
        placeholderTextColor: COLOR.text_tertiary,
        style: styles.input,
      }}
      suggestionsListTextStyle={{
        color: COLOR.text_tertiary,
        fontSize: 16,
      }}
      inputContainerStyle={styles.inputContainer}
      suggestionsListContainerStyle={styles.suggestionsContainer}
      containerStyle={[styles.container, containerStyle]}
      controller={controller => {
        autoCompleteRef.current = controller;
        return () => {
          autoCompleteRef.current = null;
        };
      }}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
  },
  input: {
    paddingLeft: 10,
    fontSize: 16,
    color: COLOR.text_secondary
  },
  inputContainer: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLOR.text_tertiary,
    backgroundColor: COLOR.bg_primary,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10,
    color: COLOR.text_primary,
  },
  suggestionsContainer: {
    backgroundColor: COLOR.bg_secondary,
    color: COLOR.text_tertiary,
    borderWidth: 1,
    borderColor: COLOR.bg_tertiary,
    borderRadius: 8,
  },
});

export default SearchableDropdown;
