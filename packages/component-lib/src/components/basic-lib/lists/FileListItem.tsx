import { Chip, ListItem } from "@mui/material";
import { LoadingIcon } from "@loopring-web/common-resources";

export const FileListItem = ({
  name,
  onDelete,
}: {
  name: string;
  onDelete: () => void;
}) => (
  <ListItem>
    <Chip
      label={name}
      icon={<LoadingIcon />}
      variant="outlined"
      sx={{ maxWidth: 200 }}
      onDelete={onDelete}
    />
  </ListItem>
);
