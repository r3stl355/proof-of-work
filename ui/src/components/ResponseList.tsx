import React from "react";
import { Work } from '@daml.js/proof-of-work';
import { Popup, Label, Icon, List, Button } from 'semantic-ui-react';
import { userContext } from './App';

type Props = {
  responses: Work.Response[]
};

const ResponseList: React.FC<Props> = ({responses}) => {

  const ledger = userContext.useLedger();

  const createCancelHandler = (response: Work.Response) => {
    return async () => {
      try {
        const key = {
          _1: response.requestKey,
          _2: response.sender, 
          _3: response.content}; 
        await ledger.exerciseByKey(Work.Response.Cancel, key, {});
      } catch (error) {
        alert(`Error:\n${JSON.stringify(error)}`);
      }
    }
  }

  return (
    <List divided selection>
      {responses.map(response => 
        <List.Item key={JSON.stringify(response)} as='a'>
          <div>
            <Popup content='Response' 
              trigger={<Label>{response.content}</Label>} />
            {response.status === "Active" ?
              <Button color='red' floated="right" 
                onClick={createCancelHandler(response)}>Cancel
              </Button> :
              <>
                {response.status === "Accepted" ? 
                  <Popup content='Accepted' 
                    trigger={<Icon color='teal' size='large' name='thumbs up' />} 
                  /> :
                  <>
                    {response.status === "Rejected" ? 
                      <Popup content='Rejected' 
                        trigger={<Icon color='red' size='large' name='thumbs down' />} 
                      /> :
                      <Popup content='Cancelled' 
                        trigger={<Icon color='red' size='large' name='cancel' />} 
                      />
                    }
                  </>
                }
              </>
            }
          </div>
      </List.Item>
      )}
    </List>
  );
};

export default ResponseList;
