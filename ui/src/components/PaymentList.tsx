import React from "react";
import { Coin } from '@daml.js/proof-of-work';
import { Popup, Label, List, Button } from 'semantic-ui-react';
import { userContext } from './App';
import { CreateEvent} from "@daml/ledger";

type Props = {
  transferProposalContracts: readonly CreateEvent<Coin.TransferProposal, unknown, string>[];
};

const PaymentList: React.FC<Props> = ({transferProposalContracts}) => {

  const ledger = userContext.useLedger();

  const groupedTransfers = transferProposalContracts.reduce((group: any, con: CreateEvent<Coin.TransferProposal, unknown, string>) => {
    const issuer: string = con.payload.coin.owner;
    group[issuer] = group[issuer] ?? [];
    group[issuer].push(con);
    return group;
  }, {});

  const createAcceptHandler = (issuer: string) => {
    return async () => {
      try {
        // for (var key in groupedTransfers) {
        const transfers = groupedTransfers[issuer];
        for (var i = 0; i < transfers.length; i++) {
          const cid = transfers[i].contractId;
          await ledger.exercise(Coin.TransferProposal.TransferProposal_Accept, cid, {})
        // }
        }
      } catch (error) {
        alert(`Error:\n${JSON.stringify(error)}`);
      }
    }
  }

  return (
    <List divided selection>
      {Object.entries(groupedTransfers).map(([issuer, cons], i) => 
        <List.Item key={issuer} as='a'>
          <div>
            <Popup trigger={<Label>{(cons as any).length} coins</Label>}>
              Paid by {issuer}
            </Popup>
            <Button color='teal' floated="right" 
              onClick={createAcceptHandler(issuer)}>Accept
            </Button>
          </div>
      </List.Item>
      )}
    </List>
  );
};

export default PaymentList;
